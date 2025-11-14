# TerraLink – Climate-Smart Farming Dashboard (Challenge)

TerraLink helps small farmers in Tunisia face **drought** and **irregular rainfall**
by combining:

- IoT soil + weather sensors (ESP32)
- Smart drought / water stress detection
- Automatic **microinsurance triggers**
- A web dashboard for NGOs, insurers and youth technicians

This dashboard is a prototype built for the **Sight Group challenge**.

---

## 🌍 Problem

Many small farmers in Tunisia:

- Depend mainly on **rainfed agriculture**
- Have **limited irrigation resources**
- Are exposed to **more frequent droughts** due to climate change
- Suffer crop losses, unstable income, food insecurity and rural migration

Current digital tools often fail because:

- They do not involve farmers or local youth
- They do not connect **sensor data** to **fast financial support** (insurance)

---

## ✅ Solution – TerraLink

TerraLink provides an end-to-end support system:

- **IoT sensors** (ESP32 + soil moisture + temperature + rainfall, solar-powered)
- **Detection engine** using simple rules (and later ML)
- **Dashboard + mobile app** for visualization and decisions
- **Microinsurance integration** to trigger quick support when crops fail

This repo implements the **dashboard** part of the solution.

---

## 🧱 Main Features

### 1. Overview

- Key indicators:
  - Average soil moisture (%)
  - Average temperature (°C)
  - Total rainfall (mm)
  - Number of active alerts
- **Live simulation card**:
  - Simulates a single farm's sensor data changing every few seconds
  - Status switches between:
    - ✅ Normal conditions
    - 🟡 Water stress risk
    - 🔴 Drought alert

### 2. Analytics

- **Time-series chart** of soil moisture and temperature per day
- **Regional comparison**:
  - Average soil moisture by region: North / Center / South
- Helps partners see **trends** and **which regions are at highest risk**

### 3. Alerts & Microinsurance

- Detection rules implemented:

  - **Drought onset**  
    Prolonged soil moisture below a crop threshold  
  - **Acute water stress**  
    Rapid moisture drop + high temperature + no rain  
  - **Flood / excess water**  
    High rainfall + saturated soil  
  - **Irrigation failure**  
    Water applied but no moisture increase detected  

- Each alert includes:
  - Type, severity, farm ID, timestamp, resolved flag
  - **Microinsurance status**:
    - `none`
    - `pending` (trigger sent to partner)
    - `approved`
    - `rejected`

> Medium/high severity alerts are automatically flagged as **pending** to simulate
> microinsurance partners being notified for rapid support.

### 4. Map (Tunisia farms)

- Interactive map using **React-Leaflet + OpenStreetMap**
- Shows sample farms in Tunisia with status:

  - ✅ Normal  
  - 🟡 Water stress  
  - 🔴 Drought risk  

- Clicking a farm can open its detailed page.

### 5. Farm Details Page

- Path: `/farm/:farmId`
- For each farm, shows:

  - Latest soil moisture, temperature, rainfall
  - Current status (normal / water stress / drought risk)
  - **Smart irrigation advice** based on readings:
    - When to irrigate (now / within 24h / not needed)
    - Practical tips (avoid midday irrigation, etc.)
  - Mini chart of soil moisture & temperature over time
  - List of alerts for this farm with microinsurance status

> This page demonstrates how TerraLink can support **individual farmers** with
> tailored recommendations and financial protection.

---

## 🛠 Tech Stack

- **Frontend**
  - React + TypeScript + Vite
  - React Router
  - Tailwind CSS
  - Recharts (charts)
  - React-Leaflet + Leaflet (map)

- **Data & Logic**
  - Sample sensor data in `sample-data.json`
  - Detection rules in `detections.ts`
  - Types in `types.ts`

Backend / hardware (conceptual):

- ESP32-based IoT nodes with soil moisture, temperature and rain sensors
- Solar-powered
- Cloud backend (Node.js / Python) with database + API (not fully implemented here)

---

## 🚀 How to Run

```bash
npm install
npm run dev
