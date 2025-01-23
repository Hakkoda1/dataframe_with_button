# How to contribute: 

## Prerequisites

- **Python 3.8 or later** is required.
- Install **pip** (comes bundled with Python 3.4+).
- Install Node on your local
---

## Setup Instructions
### 1. Clone the Repository
```bash
git clone https://github.com/Hakkoda1/dataframe_with_button.git
cd dataframe_with_button/dataframe_with_button
```
### 2. Create a Virtual Environment
It's recommended to use a virtual environment to manage dependencies.

```
python3 -m venv venv
source venv/bin/activate
```

### 3. Install requirements.txt
```commandline
pip install -r requirements.txt

```
### 4. Change RELEASE

```
_RELEASE = False
```

### 4. Bring up Frontend
```commandline
cd frontend
npm run start
```

### 5. CODE AND CONTRIBUTE

## RELEASING:
### 6. Build the frontend
```commandline
npm run build
```
### 7. Change back the RELEASE
```commandline
_RELEASE = True
```

### 7. Increase the version in setup.sql

## AND PUSH YOUR BUILD FILES AND EVERYTHING

## THAT's IT. Thanks for contribution
