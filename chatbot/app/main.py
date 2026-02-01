from fastapi import FastAPI, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from agents import Agent, SQLiteSession, handoff, RunContextWrapper, Runner, function_tool
from pydantic import BaseModel, Field
import asyncio
import httpx
from typing import List, Optional
from .configure.config import GEMINI_API_KEY, GEMINI_MODEL_NAME
import os
from datetime import datetime
import jwt
from jwt import DecodeError

# Remove direct MongoDB imports since we're using API calls instead

# Security scheme for JWT token
security_scheme = HTTPBearer()

# Define Pydantic models for validation
class WorkoutInput(BaseModel):
    exerciseType: str = Field(..., description="Type of exercise")
    duration: float = Field(..., description="Duration in minutes")
    intensity: str = Field(..., description="Intensity level (low, medium, high)")
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    token: str = Field(..., description="JWT token for authentication")

class NutritionInput(BaseModel):
    meal: str = Field(..., description="Name of the meal")
    calories: float = Field(..., description="Number of calories")
    protein: float = Field(..., description="Amount of protein in grams")
    carbs: float = Field(..., description="Amount of carbs in grams")
    fats: float = Field(..., description="Amount of fats in grams")
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    token: str = Field(..., description="JWT token for authentication")

class WeightInput(BaseModel):
    weight: float = Field(..., description="Weight in kg")
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    token: str = Field(..., description="JWT token for authentication")

class GoalInput(BaseModel):
    title: str = Field(..., description="Goal title")
    goalType: str = Field(..., description="Type of goal (weight loss, fitness, etc.)")
    targetValue: str = Field(..., description="Target value for the goal")
    deadline: str = Field(..., description="Deadline date in YYYY-MM-DD format")
    token: str = Field(..., description="JWT token for authentication")

class ChatRequest(BaseModel):
    message: str
    token: str = Field(..., description="JWT token for authentication")


# Get API base URL from environment - this should point to the main backend API
API_BASE_URL = os.getenv("BACKEND_API_URL", "https://bashartc14-ftt.hf.space")

# For development, you might want to use a different URL
# Uncomment the following line if running in development against a local backend
# API_BASE_URL = os.getenv("BACKEND_API_URL", "http://localhost:5000")


async def verify_token(token: str) -> dict:
    """Verify JWT token and return user info"""
    import logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)

    try:
        # Get JWT secret from environment
        jwt_secret = os.getenv("JWT_SECRET")
        logger.info(f"JWT Secret configured: {'Yes' if jwt_secret else 'No'}")

        if not jwt_secret:
            raise HTTPException(status_code=500, detail="JWT secret not configured")

        # Decode the token
        logger.info(f"Attempting to decode token: {token[:20]}...")
        payload = jwt.decode(token, jwt_secret, algorithms=["HS256"])
        logger.info(f"Token decoded successfully. Payload: {payload}")
        return payload
    except DecodeError as e:
        logger.error(f"DecodeError: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        logger.error(f"Token verification failed: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Token verification failed: {str(e)}")


async def make_authenticated_request(endpoint: str, method: str, data: dict = None, token: str = None):
    """Make authenticated request to backend API"""
    import logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)

    headers = {
        "Content-Type": "application/json"
    }

    if token:
        headers["Authorization"] = f"Bearer {token}"

    logger.info(f"Making request to: {API_BASE_URL}{endpoint}")
    logger.info(f"Method: {method}")
    logger.info(f"Headers: {headers}")
    logger.info(f"Data: {data}")

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            if method.upper() == "GET":
                response = await client.get(f"{API_BASE_URL}{endpoint}", headers=headers)
            elif method.upper() == "POST":
                response = await client.post(f"{API_BASE_URL}{endpoint}", json=data, headers=headers)
            elif method.upper() == "PUT":
                response = await client.put(f"{API_BASE_URL}{endpoint}", json=data, headers=headers)
            elif method.upper() == "DELETE":
                response = await client.delete(f"{API_BASE_URL}{endpoint}", headers=headers)
            else:
                raise Exception(f"Unsupported HTTP method: {method}")

            logger.info(f"Response status: {response.status_code}")

            # Log response content before checking status
            response_text = response.text
            logger.info(f"Response content: {response_text[:1000]}...")  # First 1000 chars

            # Check status and raise for errors
            response.raise_for_status()

            # Parse and return JSON response
            return response.json()
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTPStatusError: {e}")
            logger.error(f"Response status: {e.response.status_code}")
            try:
                response_text = e.response.text
                logger.error(f"Response content: {response_text}")
            except:
                logger.error("Could not read response content")
            raise HTTPException(status_code=e.response.status_code, detail=f"API request failed: Status {e.response.status_code}")
        except Exception as e:
            logger.error(f"General exception: {str(e)}")
            logger.exception("Full traceback:")
            raise HTTPException(status_code=500, detail=f"Request error: {str(e)}")


# Core logic function without decorator
async def _add_workout_logic(input_data, token: str = None) -> dict:
    """Core logic for adding a new workout record using authenticated API."""
    try:
        if not token:
            return {"success": False, "message": "No authentication token provided to function"}

        # Handle input data - it might be a dict or a Pydantic model
        exercise_type = None
        duration = None
        intensity = None
        date = None

        if isinstance(input_data, dict):
            # Try to map different possible parameter names that the agent might send
            exercise_type = input_data.get('exerciseType') or input_data.get('exercise') or input_data.get('activity') or input_data.get('workoutType') or input_data.get('name')
            duration = input_data.get('duration') or input_data.get('time') or input_data.get('length') or input_data.get('minutes')
            intensity = input_data.get('intensity') or input_data.get('level') or input_data.get('difficulty', 'moderate')
            date = input_data.get('date') or input_data.get('workoutDate') or input_data.get('day', '')

            # If date is still empty, use today's date
            if not date:
                import datetime
                date = datetime.datetime.now().strftime('%Y-%m-%d')
        elif isinstance(input_data, str):
            # If input is a string, try to parse it for workout information
            import re

            input_str = input_data.lower()
            exercise_type = input_str  # Use the whole string initially

            # Try to extract duration (numbers followed by time units)
            time_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:min|minutes?|hours?|hrs?)', input_str)
            if time_match:
                duration = float(time_match.group(1))
                # Remove the time part from the exercise type
                exercise_type = re.sub(r'\d+\s*(?:min|minutes?|hours?|hrs?)', '', input_str).strip()
            else:
                duration = 30  # Default duration

            # Determine intensity based on keywords - Backend expects capitalized values: 'Low', 'Medium', 'High'
            if any(word in input_str for word in ['high', 'intense', 'hard', 'vigorous']):
                intensity = 'High'
            elif any(word in input_str for word in ['low', 'light', 'easy', 'gentle']):
                intensity = 'Low'
            else:
                intensity = 'Medium'  # Default to Medium (capitalized as expected by backend)

            # Set date to today
            import datetime
            date = datetime.datetime.now().strftime('%Y-%m-%d')
        else:
            # Assume it's a Pydantic model
            exercise_type = getattr(input_data, 'exerciseType', None) or getattr(input_data, 'exercise', None) or getattr(input_data, 'activity', None) or getattr(input_data, 'name', None)
            duration = getattr(input_data, 'duration', None) or getattr(input_data, 'time', None) or getattr(input_data, 'minutes', None)
            intensity = getattr(input_data, 'intensity', None) or getattr(input_data, 'level', 'moderate')
            date = getattr(input_data, 'date', '') or getattr(input_data, 'workoutDate', '')

            # Capitalize intensity to match backend expectation: 'Low', 'Medium', 'High'
            if intensity:
                intensity = intensity.capitalize() if intensity.lower() in ['low', 'medium', 'high'] else 'Medium'

            # If date is still empty, use today's date
            if not date:
                import datetime
                date = datetime.datetime.now().strftime('%Y-%m-%d')

        if not exercise_type or duration is None or not intensity or not date:
            return {"success": False, "message": "Missing required parameters for workout"}

        # Verify the token to ensure user is authenticated
        user_info = await verify_token(token)

        # Prepare workout data without userId (it will be extracted from token on backend)
        workout_data = {
            "exerciseType": exercise_type,
            "duration": duration,
            "intensity": intensity,
            "date": date
        }

        # Make authenticated request to backend
        result = await make_authenticated_request(
            "/api/workouts",
            "POST",
            workout_data,
            token
        )

        return {"success": True, "message": f"Workout {exercise_type} added successfully", "data": result}
    except Exception as e:
        return {"success": False, "message": f"Error adding workout: {str(e)}"}

# Original function_tool decorated function that can be used in the original agent
@function_tool()
async def add_workout(input_data: WorkoutInput, token: str = None) -> dict:
    """Add a new workout record using authenticated API."""
    return await _add_workout_logic(input_data, token)


# Core logic function without decorator
async def _add_nutrition_logic(input_data, token: str = None) -> dict:
    """Core logic for adding a new nutrition record using authenticated API."""
    try:
        if not token:
            return {"success": False, "message": "No authentication token provided to function"}

        # Handle input data - it might be a dict or a Pydantic model
        meal = None
        calories = None
        protein = None
        carbs = None
        fats = None
        date = None

        if isinstance(input_data, dict):
            # Try to map different possible parameter names that the agent might send
            meal = input_data.get('meal') or input_data.get('food') or input_data.get('dish') or input_data.get('item') or input_data.get('name', '')
            calories = input_data.get('calories') or input_data.get('cal', None) or input_data.get('energy', None)
            protein = input_data.get('protein') or input_data.get('proteins', None)
            carbs = input_data.get('carbs') or input_data.get('carbohydrates', None)
            fats = input_data.get('fats') or input_data.get('fat', None) or input_data.get('lipids', None)
            date = input_data.get('date') or input_data.get('nutritionDate') or input_data.get('day', '')

            # If date is still empty, use today's date
            if not date:
                import datetime
                date = datetime.datetime.now().strftime('%Y-%m-%d')

            # If required fields are missing, try to infer from the meal name
            if not calories or calories == 0:
                # Simple heuristic: try to extract calories from meal description
                import re
                cal_match = re.search(r'(\d+)\s*(?:cal|calories?)', meal.lower())
                if cal_match:
                    calories = float(cal_match.group(1))

        elif isinstance(input_data, str):
            # If input is a string, try to parse it for nutrition information
            import re

            input_str = input_data.lower()
            meal = input_str  # Use the whole string initially

            # Try to extract calories (numbers followed by cal/calories)
            cal_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:cal|calories?)', input_str)
            if cal_match:
                calories = float(cal_match.group(1))
                # Remove calorie info from meal description
                input_str = re.sub(r'\d+\s*(?:cal|calories?)', '', input_str).strip()
            else:
                calories = 0  # Will be estimated later

            # Try to extract protein, carbs, fats
            protein = 0
            carbs = 0
            fats = 0

            # Set date to today
            import datetime
            date = datetime.datetime.now().strftime('%Y-%m-%d')

        else:
            # Assume it's a Pydantic model
            meal = getattr(input_data, 'meal', None) or getattr(input_data, 'food', None) or getattr(input_data, 'name', '')
            calories = getattr(input_data, 'calories', None) or getattr(input_data, 'cal', None)
            protein = getattr(input_data, 'protein', None)
            carbs = getattr(input_data, 'carbs', None)
            fats = getattr(input_data, 'fats', None) or getattr(input_data, 'fat', None)
            date = getattr(input_data, 'date', '') or getattr(input_data, 'nutritionDate', '')

            # If date is still empty, use today's date
            if not date:
                import datetime
                date = datetime.datetime.now().strftime('%Y-%m-%d')

        # Validate required fields
        if not meal:
            return {"success": False, "message": "Missing required parameter: meal name"}

        # If some nutritional values are missing, provide defaults
        if calories is None:
            calories = 0  # Will be calculated or estimated later if possible
        if protein is None:
            protein = 0
        if carbs is None:
            carbs = 0
        if fats is None:
            fats = 0

        # Verify the token to ensure user is authenticated
        user_info = await verify_token(token)

        # Prepare nutrition data without userId (it will be extracted from token on backend)
        nutrition_data = {
            "meal": meal,
            "calories": calories,
            "protein": protein,
            "carbs": carbs,
            "fats": fats,
            "date": date
        }

        # Make authenticated request to backend
        result = await make_authenticated_request(
            "/api/nutrition",
            "POST",
            nutrition_data,
            token
        )

        return {"success": True, "message": f"Nutrition log for {meal} added successfully", "data": result}
    except Exception as e:
        return {"success": False, "message": f"Error adding nutrition: {str(e)}"}

# Original function_tool decorated function that can be used in the original agent
@function_tool()
async def add_nutrition(input_data: NutritionInput, token: str = None) -> dict:
    """Add a new nutrition record using authenticated API."""
    return await _add_nutrition_logic(input_data, token)


# Core logic function without decorator
async def _add_weight_logic(input_data, token: str = None) -> dict:
    """Core logic for adding a new weight record using authenticated API."""
    try:
        if not token:
            return {"success": False, "message": "No authentication token provided to function"}

        # Handle input data - it might be a dict or a Pydantic model
        weight_value = None
        date = None

        if isinstance(input_data, dict):
            # Try to map different possible parameter names that the agent might send
            weight_value = input_data.get('weight') or input_data.get('weightValue') or input_data.get('value') or input_data.get('amount')
            date = input_data.get('date') or input_data.get('weightDate') or input_data.get('day', '')

            # If date is still empty, use today's date
            if not date:
                import datetime
                date = datetime.datetime.now().strftime('%Y-%m-%d')

            # Try to extract weight from text if it's not provided directly
            if weight_value is None:
                import re
                # Look for patterns like "75kg", "150 lbs", etc.
                text_input = str(weight_value or '') + ' ' + str(date or '')
                kg_match = re.search(r'(\d+(?:\.\d+)?)\s*kg', text_input.lower())
                if kg_match:
                    weight_value = float(kg_match.group(1))
                else:
                    lb_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:lbs?|pounds?)', text_input.lower())
                    if lb_match:
                        # Convert pounds to kg
                        weight_value = float(lb_match.group(1)) * 0.453592

        elif isinstance(input_data, str):
            # If input is a string, try to parse it for weight information
            import re

            input_str = input_data.lower()

            # Look for patterns like "75kg", "150 lbs", etc.
            kg_match = re.search(r'(\d+(?:\.\d+)?)\s*kg', input_str)
            if kg_match:
                weight_value = float(kg_match.group(1))
            else:
                lb_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:lbs?|pounds?)', input_str)
                if lb_match:
                    # Convert pounds to kg
                    weight_value = float(lb_match.group(1)) * 0.453592
                else:
                    # If no weight found, try to extract any number that could be weight
                    numbers = re.findall(r'\d+(?:\.\d+)?', input_str)
                    if numbers:
                        weight_value = float(numbers[0])  # Take the first number as weight
                    else:
                        weight_value = 70  # Default weight

            # Set date to today
            import datetime
            date = datetime.datetime.now().strftime('%Y-%m-%d')

        else:
            # Assume it's a Pydantic model
            weight_value = getattr(input_data, 'weight', None) or getattr(input_data, 'weightValue', None)
            date = getattr(input_data, 'date', '') or getattr(input_data, 'weightDate', '')

            # If date is still empty, use today's date
            if not date:
                import datetime
                date = datetime.datetime.now().strftime('%Y-%m-%d')

        if weight_value is None or not date:
            return {"success": False, "message": "Missing required parameters for weight"}

        # Verify the token to ensure user is authenticated
        user_info = await verify_token(token)

        # Prepare weight data without userId (it will be extracted from token on backend)
        weight_data = {
            "weight": weight_value,
            "date": date
        }

        # Make authenticated request to backend
        result = await make_authenticated_request(
            "/api/weights",
            "POST",
            weight_data,
            token
        )

        return {"success": True, "message": f"Weight {weight_value}kg added successfully", "data": result}
    except Exception as e:
        return {"success": False, "message": f"Error adding weight: {str(e)}"}

# Original function_tool decorated function that can be used in the original agent
@function_tool()
async def add_weight(input_data: WeightInput, token: str = None) -> dict:
    """Add a new weight record using authenticated API."""
    return await _add_weight_logic(input_data, token)


# Core logic function without decorator
async def _add_goal_logic(input_data, token: str = None) -> dict:
    """Core logic for adding a new goal record using authenticated API."""
    try:
        if not token:
            return {"success": False, "message": "No authentication token provided to function"}

        # Handle input data - it might be a dict or a Pydantic model
        title = None
        goal_type = None
        target_value = None
        deadline = None

        if isinstance(input_data, dict):
            # Try to map different possible parameter names that the agent might send
            title = input_data.get('title') or input_data.get('goalName') or input_data.get('name')
            goal_type = input_data.get('goalType') or input_data.get('category') or input_data.get('type', 'fitness')
            target_value = input_data.get('targetValue') or input_data.get('targetDate') or input_data.get('deadline') or 'Not specified'
            deadline = input_data.get('deadline') or input_data.get('targetDate') or input_data.get('target_date') or input_data.get('due_date') or input_data.get('date', '2024-12-31')  # Default date

            # If we still don't have a title, try to construct it from the goalName
            if not title and input_data.get('goalName'):
                title = input_data['goalName']
        elif isinstance(input_data, str):
            # If input is a string, treat it as the goal description
            # Parse the string to extract components
            import re

            # The input is like "Running 10k by 2 months"
            input_str = input_data
            title = input_str  # Use the entire string as title initially

            # Try to extract date patterns like "in X months" or "by X months"
            month_match = re.search(r'(?:in|by)\s+(\d+)\s+months?', input_str.lower())
            if month_match:
                import datetime
                months = int(month_match.group(1))
                future_date = datetime.datetime.now() + datetime.timedelta(days=months*30)
                deadline = future_date.strftime('%Y-%m-%d')
                # Remove the date part from the title
                title = re.sub(r'(?:in|by)\s+\d+\s+months?', '', input_str, flags=re.IGNORECASE).strip()
            else:
                # Look for other patterns
                import datetime
                future_date = datetime.datetime.now() + datetime.timedelta(days=90)  # Default 3 months
                deadline = future_date.strftime('%Y-%m-%d')

            # Set target_value to the original string
            target_value = input_str

            # Infer goal type from the title
            goal_type = 'fitness'  # Default to fitness
        else:
            # Assume it's a Pydantic model
            title = getattr(input_data, 'title', None) or getattr(input_data, 'goalName', None)
            goal_type = getattr(input_data, 'goalType', None) or getattr(input_data, 'category', 'fitness')
            target_value = getattr(input_data, 'targetValue', None) or getattr(input_data, 'targetDate', 'Not specified')
            deadline = getattr(input_data, 'deadline', None) or getattr(input_data, 'targetDate', '2024-12-31')

        # Validate that we have at least a title
        if not title:
            return {"success": False, "message": "Missing required parameter: title (or goalName)"}

        # If deadline is still not provided or invalid, use a default
        if not deadline or deadline == '2024-12-31' or 'month' in str(deadline).lower():
            # Try to extract date from the title or other fields
            import re
            # Look for patterns like "in X months", etc.
            text_input = f"{title} {target_value} {deadline}".lower()

            # If it says "in X months", calculate approximate date
            month_match = re.search(r'in (\d+) months?', text_input)
            if month_match:
                import datetime
                months = int(month_match.group(1))
                future_date = datetime.datetime.now() + datetime.timedelta(days=months*30)
                deadline = future_date.strftime('%Y-%m-%d')
            elif 'month' in text_input:
                # Look for other month-related patterns like "3 months", "two months", etc.
                # Simple numeric extraction for now
                import re
                numbers = re.findall(r'\d+', text_input)
                if numbers:
                    months = int(numbers[0])
                    import datetime
                    future_date = datetime.datetime.now() + datetime.timedelta(days=months*30)
                    deadline = future_date.strftime('%Y-%m-%d')
                else:
                    # Generic approximation for "months" mentioned
                    import datetime
                    future_date = datetime.datetime.now() + datetime.timedelta(days=90)  # 3 months approx
                    deadline = future_date.strftime('%Y-%m-%d')
            else:
                # Use a reasonable default
                import datetime
                future_date = datetime.datetime.now() + datetime.timedelta(days=90)  # 3 months approx
                deadline = future_date.strftime('%Y-%m-%d')

        # If goal_type is still not provided, try to infer from title
        if not goal_type:
            title_lower = str(title).lower() if title else ""
            if 'run' in title_lower or '5k' in title_lower or 'marathon' in title_lower or 'race' in title_lower or 'running' in title_lower:
                goal_type = 'fitness'
            elif 'weight' in title_lower or 'lose' in title_lower or 'gain' in title_lower:
                goal_type = 'fitness'
            elif 'strength' in title_lower or 'muscle' in title_lower or 'gym' in title_lower:
                goal_type = 'fitness'
            else:
                goal_type = 'fitness'  # Default to 'fitness'

        # Based on the backend Goal.js model, goalType must be one of:
        # ['lose-weight', 'gain-weight', 'build-muscle', 'run-distance', 'other']
        if not goal_type:
            title_lower = str(title).lower() if title else ""
            if 'run' in title_lower or '5k' in title_lower or 'marathon' in title_lower or 'race' in title_lower or 'running' in title_lower:
                goal_type = 'run-distance'
            elif 'lose' in title_lower or 'weight' in title_lower and 'lose' in title_lower:
                goal_type = 'lose-weight'
            elif 'gain' in title_lower and 'weight' in title_lower:
                goal_type = 'gain-weight'
            elif 'muscle' in title_lower or 'build' in title_lower or 'strength' in title_lower:
                goal_type = 'build-muscle'
            else:
                goal_type = 'other'  # Fallback to 'other' which should be accepted
        else:
            # Normalize and map to valid values if needed
            normalized_type = str(goal_type).lower()
            if 'run' in normalized_type or 'distance' in normalized_type:
                goal_type = 'run-distance'
            elif 'lose' in normalized_type and 'weight' in normalized_type:
                goal_type = 'lose-weight'
            elif 'gain' in normalized_type and 'weight' in normalized_type:
                goal_type = 'gain-weight'
            elif 'muscle' in normalized_type or 'build' in normalized_type or 'strength' in normalized_type:
                goal_type = 'build-muscle'
            else:
                goal_type = 'other'  # Safe fallback

        # If target_value is still not provided or is a date, use a better default
        # The backend requires targetValue as a string description, not just a date
        import re
        if not target_value or target_value == 'Not specified' or re.match(r'^\d{4}-\d{2}-\d{2}$', str(target_value)):
            # Create a meaningful target value description based on the goal
            target_value = f"Achieve goal: {title}"

        # Verify the token to ensure user is authenticated
        user_info = await verify_token(token)

        # Prepare goal data without userId (it will be extracted from token on backend)
        goal_data = {
            "title": title.strip() if title else "Untitled Goal",
            "goalType": goal_type.strip() if goal_type else "fitness",
            "targetValue": str(target_value).strip() if target_value else "Not specified",
            "deadline": deadline.strip() if deadline else "2024-12-31"
        }

        # Make authenticated request to backend
        result = await make_authenticated_request(
            "/api/goals",
            "POST",
            goal_data,
            token
        )

        return {"success": True, "message": f"Goal '{title}' added successfully", "data": result}
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error in _add_goal_logic: {str(e)}")
        logger.exception("Full traceback:")
        return {"success": False, "message": f"Error adding goal: {str(e)}"}

# Original function_tool decorated function that can be used in the original agent
@function_tool()
async def add_goal(input_data: GoalInput, token: str = None) -> dict:
    """Add a new goal record using authenticated API."""
    return await _add_goal_logic(input_data, token)


class GetWorkoutsInput(BaseModel):
    limit: int = Field(default=10, description="Number of records to retrieve")

# Core logic function without decorator
async def _get_workouts_logic(input_data, token: str = None) -> dict:
    """Core logic for getting workout records using authenticated API."""
    try:
        if not token:
            return {"success": False, "message": "No authentication token provided to function"}

        # Handle input data - it might be a dict or a Pydantic model
        limit = 10  # default value
        if isinstance(input_data, dict):
            limit = input_data.get('limit', 10)
        else:
            # Assume it's a Pydantic model
            limit = getattr(input_data, 'limit', 10)

        # Verify the token to ensure user is authenticated
        user_info = await verify_token(token)

        # Make authenticated request to backend
        result = await make_authenticated_request(
            f"/api/workouts?limit={limit}",
            "GET",
            None,
            token
        )

        return {"success": True, "data": result.get('workouts', []), "message": "Workouts retrieved successfully"}
    except Exception as e:
        return {"success": False, "message": f"Error getting workouts: {str(e)}"}

# Original function_tool decorated function that can be used in the original agent
@function_tool()
async def get_workouts(input_data: GetWorkoutsInput, token: str = None) -> dict:
    """Get workout records using authenticated API."""
    return await _get_workouts_logic(input_data, token)


class GetNutritionLogsInput(BaseModel):
    limit: int = Field(default=10, description="Number of records to retrieve")

# Core logic function without decorator
async def _get_nutrition_logs_logic(input_data, token: str = None) -> dict:
    """Core logic for getting nutrition records using authenticated API."""
    try:
        if not token:
            return {"success": False, "message": "No authentication token provided to function"}

        # Handle input data - it might be a dict or a Pydantic model
        limit = 10  # default value
        if isinstance(input_data, dict):
            limit = input_data.get('limit', 10)
        else:
            # Assume it's a Pydantic model
            limit = getattr(input_data, 'limit', 10)

        # Verify the token to ensure user is authenticated
        user_info = await verify_token(token)

        # Make authenticated request to backend
        result = await make_authenticated_request(
            f"/api/nutrition?limit={limit}",
            "GET",
            None,
            token
        )

        return {"success": True, "data": result.get('nutrition', []), "message": "Nutrition logs retrieved successfully"}
    except Exception as e:
        return {"success": False, "message": f"Error getting nutrition logs: {str(e)}"}

# Original function_tool decorated function that can be used in the original agent
@function_tool()
async def get_nutrition_logs(input_data: GetNutritionLogsInput, token: str = None) -> dict:
    """Get nutrition records using authenticated API."""
    return await _get_nutrition_logs_logic(input_data, token)


class GetWeightsInput(BaseModel):
    limit: int = Field(default=10, description="Number of records to retrieve")

# Core logic function without decorator
async def _get_weights_logic(input_data, token: str = None) -> dict:
    """Core logic for getting weight records using authenticated API."""
    try:
        if not token:
            return {"success": False, "message": "No authentication token provided to function"}

        # Handle input data - it might be a dict or a Pydantic model
        limit = 10  # default value
        if isinstance(input_data, dict):
            limit = input_data.get('limit', 10)
        else:
            # Assume it's a Pydantic model
            limit = getattr(input_data, 'limit', 10)

        # Verify the token to ensure user is authenticated
        user_info = await verify_token(token)

        # Make authenticated request to backend
        result = await make_authenticated_request(
            f"/api/weights?limit={limit}",
            "GET",
            None,
            token
        )

        return {"success": True, "data": result.get('weights', []), "message": "Weight records retrieved successfully"}
    except Exception as e:
        return {"success": False, "message": f"Error getting weight records: {str(e)}"}

# Original function_tool decorated function that can be used in the original agent
@function_tool()
async def get_weights(input_data: GetWeightsInput, token: str = None) -> dict:
    """Get weight records using authenticated API."""
    return await _get_weights_logic(input_data, token)


class GetGoalsInput(BaseModel):
    status: Optional[str] = Field(default=None, description="Filter by status (optional)")

# Core logic function without decorator
async def _get_goals_logic(input_data, token: str = None) -> dict:
    """Core logic for getting goal records using authenticated API."""
    import logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)

    try:
        if not token:
            logger.error("No authentication token provided to get_goals function")
            return {"success": False, "message": "No authentication token provided to function"}

        logger.info(f"get_goals called with token: {token[:20]}...")
        logger.info(f"Input data: {input_data}")

        # Verify the token to ensure user is authenticated
        user_info = await verify_token(token)
        logger.info(f"Token verified. User info: {user_info}")

        # Handle input data - it might be a dict or a Pydantic model
        status_filter = None
        if isinstance(input_data, dict):
            status_filter = input_data.get('status')
        else:
            # Assume it's a Pydantic model
            status_filter = getattr(input_data, 'status', None)

        endpoint = "/api/goals"
        if status_filter:
            endpoint += f"?status={status_filter}"

        logger.info(f"Making request to endpoint: {endpoint}")

        # Make authenticated request to backend
        result = await make_authenticated_request(
            endpoint,
            "GET",
            None,
            token
        )

        logger.info(f"Backend response: {result}")
        return {"success": True, "data": result.get('goals', []), "message": "Goals retrieved successfully"}
    except Exception as e:
        logger.error(f"Error in get_goals: {str(e)}")
        logger.exception("Full traceback:")
        return {"success": False, "message": f"Error getting goals: {str(e)}"}

# Original function_tool decorated function that can be used in the original agent
@function_tool()
async def get_goals(input_data: GetGoalsInput, token: str = None) -> dict:
    """Get goal records using authenticated API."""
    return await _get_goals_logic(input_data, token)


class UpdateGoalStatusInput(BaseModel):
    goal_id: str = Field(..., description="ID of the goal to update")
    status: str = Field(..., description="New status for the goal")

# Core logic function without decorator
async def _update_goal_status_logic(input_data, token: str = None) -> dict:
    """Core logic for updating the status of a goal using authenticated API."""
    try:
        if not token:
            return {"success": False, "message": "No authentication token provided to function"}

        # Handle input data - it might be a dict or a Pydantic model
        goal_id = None
        status = None

        if isinstance(input_data, dict):
            # Try to map different possible parameter names that the agent might send
            goal_id = input_data.get('goal_id') or input_data.get('id') or input_data.get('goalId') or input_data.get('taskId')
            status = input_data.get('status') or input_data.get('newStatus') or input_data.get('state') or input_data.get('value')

            # If we still don't have a goal_id, try to get it from other possible fields
            if not goal_id:
                # Check if there's a goal-related field that contains an ID-like string
                for key, value in input_data.items():
                    if 'id' in key.lower() and len(str(value)) > 5:  # Likely to be an ID
                        goal_id = value
                        break

        elif isinstance(input_data, str):
            # If input is a string, try to parse it for status update information
            input_str = input_data.lower()

            # This is trickier - typically the AI should provide structured data for updates
            # but if it sends a raw string, we'll have to make assumptions
            # For example: "update goal status to completed" or "mark goal as achieved"

            # Look for common status words - must match backend model: ['not-started', 'in-progress', 'completed', 'missed']
            if 'complete' in input_str or 'done' in input_str or 'finished' in input_str:
                status = 'completed'
            elif 'missed' in input_str or 'abandoned' in input_str or 'given up' in input_str:
                status = 'missed'  # For truly missed goals
            elif 'not started' in input_str or 'not begun' in input_str or 'waiting' in input_str:
                status = 'not-started'
            else:
                # Default to 'in-progress' for all other states (including struggling, ongoing, etc.)
                status = 'in-progress'

            # For goal_id, we can't really extract it from a raw string without more context
            # This would typically require the user to specify which goal they're updating
            # So we'll return an error asking for more specific information
            return {"success": False, "message": "To update a goal status, please specify which goal you want to update. You can say something like 'update goal #1 to completed' or ask me to show your goals first."}

        else:
            # Assume it's a Pydantic model
            goal_id = getattr(input_data, 'goal_id', None) or getattr(input_data, 'id', None) or getattr(input_data, 'goalId', None)
            status = getattr(input_data, 'status', None) or getattr(input_data, 'newStatus', None)

        if not goal_id or not status:
            return {"success": False, "message": "Missing required parameters: goal_id and status"}

        # Verify the token to ensure user is authenticated
        user_info = await verify_token(token)

        # Prepare update data
        update_data = {"status": status}

        # Make authenticated request to backend
        result = await make_authenticated_request(
            f"/api/goals/{goal_id}",
            "PUT",
            update_data,
            token
        )

        return {"success": True, "message": f"Goal status updated to '{status}'", "data": result}
    except Exception as e:
        return {"success": False, "message": f"Error updating goal status: {str(e)}"}

# Original function_tool decorated function that can be used in the original agent
@function_tool()
async def update_goal_status(input_data: UpdateGoalStatusInput, token: str = None) -> dict:
    """Update the status of a goal using authenticated API."""
    return await _update_goal_status_logic(input_data, token)


# Create the fitness tracker agent
fitness_tracker = Agent(
    name="Fitness Tracker Assistant",
    instructions="""You are a friendly and helpful fitness assistant that helps users manage their fitness journey through natural conversation.

    You can help users with:
    - Logging workouts (exercises, duration, intensity)
    - Tracking nutrition (meals, calories, macros)
    - Recording weight measurements
    - Setting and managing fitness goals
    - Viewing their progress and past records

    Key capabilities:
    - Add new fitness data when users share workout details, meals, weights, or goals
    - Retrieve and show users their existing data like previous workouts, goals, or weight history
    - Update goal statuses when users report progress
    - Provide encouraging feedback and fitness tips

    When users ask to see their data (workouts, goals, weight, nutrition), retrieve it automatically without asking for additional information.
    When users want to add something new, ask for any missing required details in a conversational way.

    All operations are automatically authenticated - you don't need to ask users for passwords or tokens.
    Just focus on having a natural, helpful conversation about their fitness journey.

    Always respond in a friendly, encouraging, and supportive tone. Be concise but warm in your interactions.""",
    model="gemini-2.5-flash-lite",
    tools=[
        add_workout,
        add_nutrition,
        add_weight,
        add_goal,
        get_workouts,
        get_nutrition_logs,
        get_weights,
        get_goals,
        update_goal_status
    ]
)


app = FastAPI(title="Fitness Tracker AI Chatbot", version="1.0.0")


@app.get("/")
async def root():
    return {"message": "Fitness Tracker AI Chatbot API", "status": "running"}

@app.get("/health")
async def health_check():
    """Health check endpoint to test connectivity to backend"""
    import logging
    import httpx
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)

    try:
        # Test basic connectivity to backend
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Try to access a basic endpoint on the backend
            response = await client.get(f"{API_BASE_URL}/", headers={"User-Agent": "Chatbot-Health-Check"})
            backend_status = f"Backend reachable, status: {response.status_code}"
    except Exception as e:
        backend_status = f"Backend unreachable: {str(e)}"

    return {
        "status": "healthy",
        "backend_connection": backend_status,
        "api_base_url": API_BASE_URL,
        "timestamp": datetime.now().isoformat()
    }


@app.post("/chat")
async def chat(request: ChatRequest):
    """Chat endpoint for sending messages to the AI agent with authentication."""
    import logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)

    try:
        logger.info(f"Received chat request with token: {request.token[:20]}...")
        logger.info(f"Message: {request.message}")

        # Verify the token before processing the request
        user_info = await verify_token(request.token)
        logger.info(f"Token verified successfully. User info: {user_info}")

        # Get user ID from token to use as session identifier
        user_id = user_info.get("id", "unknown_user")
        session_id = f"user_{user_id}"

        # Create tools that have access to the token by creating a closure
        # Instead of recreating function tools, use the original functions with bound tokens
        def bind_token_to_functions(token):
            # Create wrapper functions that call the logic functions with the token
            async def add_workout_bound(input_data):
                import logging
                logger = logging.getLogger(__name__)
                logger.info(f"add_workout_bound called with input: {input_data}")
                try:
                    result = await _add_workout_logic(input_data, token)
                    logger.info(f"add_workout result: {result}")
                    return result
                except Exception as e:
                    logger.error(f"Error in add_workout_bound: {str(e)}")
                    logger.exception("Full traceback:")
                    return {"success": False, "message": f"Error adding workout: {str(e)}"}

            async def add_nutrition_bound(input_data):
                import logging
                logger = logging.getLogger(__name__)
                logger.info(f"add_nutrition_bound called with input: {input_data}")
                try:
                    result = await _add_nutrition_logic(input_data, token)
                    logger.info(f"add_nutrition result: {result}")
                    return result
                except Exception as e:
                    logger.error(f"Error in add_nutrition_bound: {str(e)}")
                    logger.exception("Full traceback:")
                    return {"success": False, "message": f"Error adding nutrition: {str(e)}"}

            async def add_weight_bound(input_data):
                import logging
                logger = logging.getLogger(__name__)
                logger.info(f"add_weight_bound called with input: {input_data}")
                try:
                    result = await _add_weight_logic(input_data, token)
                    logger.info(f"add_weight result: {result}")
                    return result
                except Exception as e:
                    logger.error(f"Error in add_weight_bound: {str(e)}")
                    logger.exception("Full traceback:")
                    return {"success": False, "message": f"Error adding weight: {str(e)}"}

            async def add_goal_bound(input_data):
                import logging
                logger = logging.getLogger(__name__)
                logger.info(f"add_goal_bound called with input: {input_data}")
                try:
                    result = await _add_goal_logic(input_data, token)
                    logger.info(f"add_goal result: {result}")
                    return result
                except Exception as e:
                    logger.error(f"Error in add_goal_bound: {str(e)}")
                    logger.exception("Full traceback:")
                    return {"success": False, "message": f"Error adding goal: {str(e)}"}

            async def get_workouts_bound(input_data):
                import logging
                logger = logging.getLogger(__name__)
                logger.info(f"get_workouts_bound called with input: {input_data}")
                try:
                    result = await _get_workouts_logic(input_data, token)
                    logger.info(f"get_workouts result: {result}")
                    return result
                except Exception as e:
                    logger.error(f"Error in get_workouts_bound: {str(e)}")
                    logger.exception("Full traceback:")
                    return {"success": False, "message": f"Error getting workouts: {str(e)}"}

            async def get_nutrition_logs_bound(input_data):
                import logging
                logger = logging.getLogger(__name__)
                logger.info(f"get_nutrition_logs_bound called with input: {input_data}")
                try:
                    result = await _get_nutrition_logs_logic(input_data, token)
                    logger.info(f"get_nutrition_logs result: {result}")
                    return result
                except Exception as e:
                    logger.error(f"Error in get_nutrition_logs_bound: {str(e)}")
                    logger.exception("Full traceback:")
                    return {"success": False, "message": f"Error getting nutrition logs: {str(e)}"}

            async def get_weights_bound(input_data):
                import logging
                logger = logging.getLogger(__name__)
                logger.info(f"get_weights_bound called with input: {input_data}")
                try:
                    result = await _get_weights_logic(input_data, token)
                    logger.info(f"get_weights result: {result}")
                    return result
                except Exception as e:
                    logger.error(f"Error in get_weights_bound: {str(e)}")
                    logger.exception("Full traceback:")
                    return {"success": False, "message": f"Error getting weights: {str(e)}"}

            async def get_goals_bound(input_data):
                import logging
                logger = logging.getLogger(__name__)
                logger.info(f"get_goals_bound called with input: {input_data}")
                try:
                    result = await _get_goals_logic(input_data, token)
                    logger.info(f"get_goals result: {result}")
                    return result
                except Exception as e:
                    logger.error(f"Error in get_goals_bound: {str(e)}")
                    logger.exception("Full traceback:")
                    return {"success": False, "message": f"Error getting goals: {str(e)}"}

            async def update_goal_status_bound(input_data):
                import logging
                logger = logging.getLogger(__name__)
                logger.info(f"update_goal_status_bound called with input: {input_data}")
                try:
                    result = await _update_goal_status_logic(input_data, token)
                    logger.info(f"update_goal_status result: {result}")
                    return result
                except Exception as e:
                    logger.error(f"Error in update_goal_status_bound: {str(e)}")
                    logger.exception("Full traceback:")
                    return {"success": False, "message": f"Error updating goal status: {str(e)}"}

            # Now create FunctionTool objects with the bound functions
            from agents import function_tool

            return [
                function_tool()(add_workout_bound),
                function_tool()(add_nutrition_bound),
                function_tool()(add_weight_bound),
                function_tool()(add_goal_bound),
                function_tool()(get_workouts_bound),
                function_tool()(get_nutrition_logs_bound),
                function_tool()(get_weights_bound),
                function_tool()(get_goals_bound),
                function_tool()(update_goal_status_bound)
            ]

        tools_with_token = bind_token_to_functions(request.token)

        # Create a temporary agent with token-aware tools
        temp_fitness_tracker = Agent(
            name="Fitness Tracker Assistant",
            instructions="""You are a friendly and helpful fitness assistant that helps users manage their fitness journey through natural conversation.

    You can help users with:
    - Logging workouts (exercises, duration, intensity)
    - Tracking nutrition (meals, calories, macros)
    - Recording weight measurements
    - Setting and managing fitness goals
    - Viewing their progress and past records

    Key capabilities:
    - Add new fitness data when users share workout details, meals, weights, or goals
    - Retrieve and show users their existing data like previous workouts, goals, or weight history
    - Update goal statuses when users report progress
    - Provide encouraging feedback and fitness tips

    When users ask to see their data (workouts, goals, weight, nutrition), retrieve it automatically without asking for additional information.
    When users want to add something new, ask for any missing required details in a conversational way.

    All operations are automatically authenticated - you don't need to ask users for passwords or tokens.
    Just focus on having a natural, helpful conversation about their fitness journey.

    Always respond in a friendly, encouraging, and supportive tone. Be concise but warm in your interactions.""",
            model="gemini-2.5-flash",
            tools=tools_with_token
        )

        # Create a session specific to the user to maintain conversation history
        session = SQLiteSession("fitness_chatbot.db", session_id)

        # Run the agent directly with the user's message
        result = await Runner.run(
            starting_agent=temp_fitness_tracker,
            input=request.message,
            session=session
        )

        logger.info(f"Agent response: {result.final_output}")

        return {
            "success": True,
            "response": str(result.final_output),
            "timestamp": datetime.now().isoformat(),
            "user_id": user_info.get("id")  # Include user info in response
        }
    except Exception as e:
        logger.error(f"Chat endpoint error: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)