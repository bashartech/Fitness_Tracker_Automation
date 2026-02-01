---
title: Fitness Tracker AI Chatbot
emoji: 🏋️‍♂️
colorFrom: blue
colorTo: green
sdk: docker
pinned: false
---

# Fitness Tracker AI Chatbot

An AI-powered chatbot that helps users manage their fitness journey through natural conversation. The chatbot integrates with the Fitness Tracker backend to log workouts, track nutrition, record weights, and manage goals.

## Features

- Natural language interaction for fitness management
- Log workouts (exercises, duration, intensity)
- Track nutrition (meals, calories, macros)
- Record weight measurements
- Set and manage fitness goals
- View existing data and progress

## How to Use

1. Obtain a JWT authentication token from the main Fitness Tracker application
2. Enter your token in the "Authentication Token" field
3. Type your message in the chat box (e.g., "I did a 30-minute cardio session today")
4. Click "Send Message" to interact with the AI assistant

## Requirements

- A valid JWT token from the Fitness Tracker app
- Internet connection to access the backend API

## Setup for Local Development

```bash
pip install -r requirements.txt
python app.py
```

## Environment Variables

The application requires the following environment variables:

- `GEMINI_API_KEY`: Your Google Gemini API key
- `JWT_SECRET`: The secret used to verify JWT tokens
- `BACKEND_API_URL`: URL of the backend API (defaults to Hugging Face Space URL)

Check out the configuration reference at https://huggingface.co/docs/hub/spaces-config-reference
