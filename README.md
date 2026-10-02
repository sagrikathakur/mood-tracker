# 🌿 Mood Tracker

A full-stack mood tracking and journaling application built with the **PERN stack**.

Mood Tracker helps people record how they feel each day, write personal journal entries and capture moments through stickers and image uploads. The goal is to make journaling simple, visual and personal.

## ✨ What It Does

Users can create a daily mood journal where they can:

* 😊 Track their current mood
* 📝 Write a journal entry about their day
* 🎨 Add fun stickers to their journal
* 📷 Upload images and memories
* 📅 View their mood and journal history
* 🔍 Search and filter previous entries
* 📊 See their mood patterns over time
* ✏️ Edit existing journal entries
* 🗑️ Delete entries they no longer want

Each journal entry becomes a small snapshot of the user's day.

## 🎨 Mood & Sticker System

Users can choose a mood when creating an entry.

Example moods:

| Mood       | Example                        |
| ---------- | ------------------------------ |
| 😄 Happy   | Had a really good day          |
| 😌 Calm    | Relaxing and peaceful          |
| 😐 Neutral | Nothing special today          |
| 😔 Sad     | Difficult day                  |
| 😡 Angry   | Something frustrating happened |
| 😰 Anxious | Feeling stressed               |
| 🤩 Excited | Something great happened       |
| 😴 Tired   | Low energy today               |

Users can also decorate their journal with **stickers**.

Example stickers:

```text
🌸 🌈 ⭐ ❤️ ☕ 🎵 🌙 ✨ 🐱 🌻 🎂 🏖️
```

Stickers can be used to make entries more personal and visually interesting.

## 📖 Journal Entries

A journal entry can contain:

```text
Date
Mood
Journal Text
Stickers
Images
Created At
Updated At
```

Example:

```text
October 2, 2026

Mood: 😊 Happy

"Had a really productive day. Finished my React
work and went out for coffee in the evening."

Stickers:
☕ ⭐ 🌸

Images:
📷 coffee.jpg
📷 sunset.jpg
```

## 🖼️ Image Uploads

Users can attach images to their journal entries.

Possible use cases:

* Photos from their day
* Food
* Travel memories
* Pets
* Nature
* Screenshots
* Personal moments

Images can be uploaded from the user's device and associated with a specific journal entry.

For production deployment, uploaded files can be stored using services such as cloud object storage instead of directly storing large files inside PostgreSQL.

## 📊 Mood Dashboard

The dashboard gives users an overview of their emotional patterns.

It can show:

* Today's mood
* Recent journal entries
* Most common mood
* Weekly mood overview
* Monthly mood trends
* Total journal entries
* Recent uploaded memories

Example:

```text
        Your Mood This Week

Mon    😊
Tue    😌
Wed    😔
Thu    😄
Fri    🤩
Sat    😴
Sun    😊
```

The purpose is not to diagnose anything. It simply helps users **notice their own journaling and mood patterns**.

## 🗂️ Journal History

Users can browse their previous entries through a timeline or card-based interface.

```text
┌─────────────────────────────┐
│ October 2                   │
│ 😊 Happy                    │
│                             │
│ Had a productive day...     │
│                             │
│ ☕ ⭐ 🌸                     │
│                             │
│ 📷 2 Photos                 │
└─────────────────────────────┘

┌─────────────────────────────┐
│ October 1                   │
│ 😌 Calm                     │
│                             │
│ Spent the evening reading.  │
│                             │
│ 🌙 📚                       │
└─────────────────────────────┘
```

## 🔎 Search & Filters

Users can find old journal entries using:

* Mood
* Date
* Date range
* Keywords
* Stickers

For example:

```text
Search: "travel"

Mood: Happy

Date: September 2026
```

## 🛠️ Tech Stack

### Frontend

* React.js
* React Router
* JavaScript
* Tailwind CSS
* Axios

### Backend

* Node.js
* Express.js
* REST API
* JWT Authentication
* bcrypt

### Database

* PostgreSQL

### File Storage

* Image upload support
* Cloud storage for production deployment

## 🏗️ Architecture

```text
React
  │
  │ HTTP / Axios
  ↓
Express API
  │
  ├── Authentication
  ├── Journal API
  ├── Mood API
  ├── Sticker API
  └── Upload API
  │
  ↓
PostgreSQL
  │
  ├── Users
  ├── Journal Entries
  ├── Moods
  ├── Stickers
  └── Images
```

## 🗄️ Main Database Tables

### users

```text
id
name
email
password_hash
created_at
updated_at
```

### journal_entries

```text
id
user_id
mood
content
entry_date
created_at
updated_at
```

### stickers

```text
id
name
image_url
created_at
```

### journal_stickers

```text
id
journal_entry_id
sticker_id
```

### journal_images

```text
id
journal_entry_id
image_url
created_at
```

This relational structure allows one journal entry to have **multiple stickers and multiple images** without stuffing everything into one giant database column. PostgreSQL appreciates the restraint.

## 🔐 Authentication

Users can:

* Register
* Login
* Logout
* Access their private journal
* Update their profile

Journal entries belong to the authenticated user and cannot be accessed by other users.

## 🚀 Core Features

### Phase 1

* User authentication
* Create journal entry
* Select mood
* View journal history
* Edit and delete entries

### Phase 2

* Stickers
* Image uploads
* Search
* Filters
* Calendar view

### Phase 3

* Mood analytics
* Charts
* Monthly summaries
* Favorites
* Rich text journaling
* Cloud image storage
* Notifications

## 🎯 Learning Goals

This project is designed to practice real-world full-stack development:

* React components
* React state management
* Forms
* Event handling
* API integration
* Authentication
* Protected routes
* REST API design
* PostgreSQL relationships
* CRUD operations
* File uploads
* Search and filtering
* Data visualization
* Full-stack application architecture

## 📌 Project Status

**Status:** In Development

Mood Tracker is being built as a full-stack PERN project focused on combining **journaling, mood tracking and visual memories** into one application.

---

## 👩‍💻 Created & Designed By

**Sagrika**

A full-stack project built with the **PERN stack** for learning, creativity and personal journaling.

