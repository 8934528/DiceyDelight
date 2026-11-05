# Setup and Installation Guide

This guide helps you set up and run **Dicey Delight** on your computer or mobile device.

---

## 1. Prerequisites

Before you start, make sure you have installed:

- **[.NET 10 SDK](https://dotnet.microsoft.com/)** or later
- **[.NET MAUI Workload](https://dotnet.microsoft.com/en-us/apps/maui)**
- **IDE**:
  - [Visual Studio 2022 / 2026](https://visualstudio.microsoft.com/) with **.NET Multi-platform App UI development** workload, OR
  - [Visual Studio Code](https://code.visualstudio.com/) with the **C# Dev Kit** and **.NET MAUI** extension
- **For Android (Optional)**: Android SDK and an Android Emulator or physical device with USB debugging enabled

---

## 2. Install the MAUI Workload

Open your terminal or command prompt and run:

```bash
dotnet workload install maui
```

---

## 3. Clone the Project

```bash
git clone https://github.com/username/DiceyDelight.git
cd DiceyDelight
```

---

## 4. Restore Dependencies

Restore NuGet packages:

```bash
dotnet restore
```

---

## 5. Run the Application

### Option A: Using the Command Line (CLI)

- **Run on Windows Desktop:**

  ```bash
  dotnet build -t:Run -f net10.0-windows10.0.19041.0
  ```

- **Run on Android Emulator / Device:**

  ```bash
  dotnet build -t:Run -f net10.0-android
  ```

### Option B: Using Visual Studio

1. Open `DiceyDelight.slnx` or `DiceyDelight.csproj` in Visual Studio.
2. In the top toolbar, select your target platform:
   - **Windows Machine** (to test on desktop)
   - **Android Emulators** (e.g., Pixel 7)
3. Click the green **Play / Run** button or press **F5**.

---

## 6. Project Structure

```text
DiceyDelight/
├── Components/          # Blazor Razor components
│   ├── Layout/          # MainLayout component
│   ├── Pages/           # Splash, Home, and Start (Game) screens
│   └── Shared/          # Reusable UI (DiceCube, PlayerCard, NumberGrid)
├── DOCS/                # Documentation (Setup and How to Play)
├── Platforms/           # Platform-specific entry points (Android, Windows, iOS, Mac)
├── Resources/           # App icons, splash screens, images, and fonts
├── Services/            # Core C# game logic, engine, and player models
└── wwwroot/             # Web assets (Bootstrap, local icons, sounds, CSS, JS)
```

---

## 7. Troubleshooting

- **Workload not found?** Run `dotnet workload restore` to ensure all MAUI components are installed.
- **Windows Developer Mode**: On Windows 10/11, enable **Developer Mode** in Windows Settings (`Settings > System > For developers`).
- **Icons missing?** All UI icons use offline local Bootstrap Icons bundled inside `wwwroot/lib/bootstrap-icons/`.
