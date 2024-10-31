using System;
using System.Collections.Generic;
using System.Text;
using System.Timers;

namespace DiceyDelight
{
    internal class TimerCountDown
    {
        private System.Timers.Timer countdownTimer;
        private int timeRemaining;
        private bool isPaused;

        public event Action TimeUpdated;
        public event Action TimeExpired;

        public TimerCountDown(int initialTime)
        {
            timeRemaining = initialTime;
            isPaused = false;

            InitializeTimer();
        }

        private void InitializeTimer()
        {
            countdownTimer = new System.Timers.Timer(1000); 
            countdownTimer.Elapsed += OnTimedEvent;
            countdownTimer.AutoReset = true;
        }

        private void OnTimedEvent(object sender, ElapsedEventArgs e)
        {
            if (!isPaused)
            {
                if (timeRemaining > 0)
                {
                    timeRemaining--; 
                    TimeUpdated?.Invoke(); 
                }
                else
                {
                    countdownTimer.Stop(); 
                    TimeExpired?.Invoke(); 
                }
            }
        }

        public void Start()
        {
            isPaused = false; 
            countdownTimer.Start(); 
        }

        public void Pause()
        {
            isPaused = true; 
            countdownTimer.Stop(); 
        }

        public void Resume()
        {
            if (timeRemaining > 0)
            {
                isPaused = false; 
                countdownTimer.Start(); 
            }
        }

        public int GetTimeRemaining() => timeRemaining; 
    }
}