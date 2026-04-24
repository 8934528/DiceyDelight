# 🎲 DiceyDelight

A fun and engaging two-player dice game built with **Xamarin.Forms** where you compete against the computer. Roll the dice, choose your numbers, and aim for the highest score!

---

## 📱 About the Game

DiceyDelight is a turn-based dice game. The player and the computer take turns rolling three dice. The goal is to remove all number boxes from 2 to 12 by matching the sum of two dice. A special star on the third die can steal the opponent's highest number!

---

## 🎮 Game Features

- **Three Difficulty Levels** – Easy, Intermediate, and Hard (adjusts timer duration)
- **Turn-Based Gameplay** – Alternate turns between player and computer
- **Timer System** – Each turn has a time limit; if time expires, the opponent wins
- **Star Mechanic** – Rolling a star lets you steal the opponent’s highest remaining number
- **Score Tracking** – Current scores and highest score are displayed
- **Win/Loss Alerts** – Custom popups with images for game over or victory
- **Persistent High Score** – Highest score is saved across game sessions

---

## 🧩 Game Rules

1. Each turn, the player rolls **three dice**
2. The sum of the **first two dice** determines which number box (2–12) you can remove
3. If the box is still available, it is removed and added to your score
4. If the **third die shows a star (★)**:
   - You **steal the opponent's highest remaining number**
   - Their score decreases, and the box is restored to their board
5. The first player to remove **all 11 number boxes (2–12)** wins
6. If the timer runs out on your turn, you lose immediately

---

## Technology Stack

| Technology      | Purpose                         |
|-----------------|---------------------------------|
| Xamarin.Forms   | Cross-platform UI framework     |
| C#              | Game logic and backend          |
| XAML            | User interface design           |
| .NET Standard   | Shared code library             |

---

## 🚀 Getting Started

### Prerequisites

- Visual Studio 2019 or later (with Xamarin workload installed)
- .NET Framework 4.7.2 or .NET 5+
- Android SDK / iOS simulator (optional)

### Installation

1. Clone the repository:

      bash
      git clone `https://github.com/username/DiceyDelight.git`

2. Open `DiceyDelight.sln` in Visual Studio or open it on VS Cide or Antigravity or Cursor

3. Restore NuGet packages (if any)

4. Build the solution:

      text
      Build > Rebuild Solution

5. Run the app:

   - Select an emulator (Android/iOS)

   - Press F5 or click Start3.

- or run `DiceyDelight.csproj` in VS code (`dotnet run`)

## How to Play

1. Enter your name on the main screen
2. Select difficulty – Easy (longer timer) to Hard (shorter timer)
3. Click "ROLL" on your turn to roll the dice
4. The sum of the first two dice removes a number box
5. A star on the third die steals from the opponent
6. Try to clear all boxes before the computer and before your timer runs out

## Screenshots

## Screenshots

| Main Menu | Gameplay Screen | Win Alert |
|:---------:|:---------------:|:---------:|
| ![Main Menu](./DiceyDelight/DiceyDelight/public/MainPage.png) | ![Gameplay](./DiceyDelight/DiceyDelight/public/DicePlay.png) | ![Alert](./DiceyDelight/DiceyDelight/public/Alert.png) || ![Gameplay](DiceyDelight/public/DicePlay.png) | ![Alert](DiceyDelight/public/Alert.png) |

## Customization

### Change Timer Values

Modify the timer duration passed to `DicePlay` in `MainPage.xaml.cs`:

      csharp
      private void OnEasyClicked(object sender, EventArgs e)
      {
         int timerValue = 20; // Easy = 20 seconds
         Navigation.PushAsync(new DicePlay(timerValue, NameInput.Text, "Easy"));
      }

### Change Background Image

Replace `Dice2.jpg` in all platform resource folders:

- Android: Resources/drawable/
- iOS: Resources/

An exciting dice-rolling game developed as a school project by a group of students from the University of Fort Hare.
