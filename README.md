# Auction App Server

This is the server-side application for an auction platform. It includes REST API endpoints, database schema, and Docker support for containerization.

## Table of Contents

- [Project Overview](#project-overview)
- [Installation](#installation)


## Project Overview

The Auction App Server is designed to handle backend operations for an auction platform. It features routes for user authentication, auction item management, and bidding functionalities. The app is built using Node.js, Express, and supports SQL databases.

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/your-repo/AuctionAppServer.git
   cd AuctionAppServer
2.npm indepencies
npm install
3.npm start
4.Access the API at http://localhost:3000



## Docker Setup
  docker-compose up --build

## Database Schema
 mysql -u [username] -p [database_name] < DB_schema/schema.sql
