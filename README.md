
<p align="center">
  <a href="#overview"><strong>Overview</strong></a> ·
  <a href="#demo"><strong>Demo</strong></a> ·
  <a href="#architecture"><strong>Architecture</strong></a> ·
  <a href="#project-structure"><strong>Project Structure</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/AWS-232F3E?style=flat&logo=amazonwebservices&logoColor=white" alt="AWS" />
  <img src="https://img.shields.io/badge/Nginx-009639?style=flat&logo=nginx&logoColor=white" alt="Nginx" />
  <img src="https://img.shields.io/badge/Claude_AI-D97706?style=flat&logo=anthropic&logoColor=white" alt="Claude AI" />
</p>

> ⚠️ **Work in Progress** — ReYapp is actively under development. Expect breaking changes, incomplete features, and rough edges. Not yet production-ready.

---

## Overview

ReYapp is a WIP full-stack platform built to give users a unified, spoiler-free experience for engaging with TV shows and episodes. It aggregates third-party ratings, reviews, and metadata from **IMDb, Rotten Tomatoes, and Serializd** via web scraping, while enabling episode-based discussions with **AI-generated sentiment summaries** powered by Claude Haiku.

Key capabilities include JWT-based authentication with refresh tokens, user-generated posts per episode, **real-time chat via WebSockets**, and an automated show/season metadata refresh pipeline. The system is built using a production-style 3-tier architecture and deployed on AWS using Docker containerisation.

---

## Demo

https://github.com/user-attachments/assets/c6e1d4ff-c21b-4a74-a7fd-14f078d2610c

🌍 **Live:** [sandbox.reecemus.com](https://sandbox.reecemus.com)

---

## Architecture

ReYapp follows a 3-tier architecture deployed on **AWS EC2** using Docker containers, with each service running in isolation over an internal network.

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript, served via Nginx |
| Backend | FastAPI (Python) via Uvicorn |
| Database | PostgreSQL with SQLAlchemy ORM + Alembic migrations |
| Media Storage | AWS S3 |
| Auth | JWT + refresh tokens |
| Containerisation | Docker Compose, images hosted on GHCR |
| CI/CD | GitHub Actions — builds and deploys on push |

---

## Project Structure

```text
backend/
├── api/        → FastAPI route controllers
├── services/   → Business logic layer
├── models/     → Database ORM models
├── schemas/    → API request/response validation
├── auth/       → JWT authentication & security logic
├── db/         → Database session & configuration
├── core/       → App config & shared utilities
└── alembic/    → Database migrations

frontend/
├── src/pages/      → Route-level views
├── src/components/ → Reusable UI components
├── src/api/        → Backend API client layer
├── src/context/    → Global state management
├── src/lib/        → Utilities/helpers
└── src/types/      → TypeScript types
```
