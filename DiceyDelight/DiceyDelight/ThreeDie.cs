using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using Xamarin.Forms;

namespace DiceyDelight
{
	public class ThreeDie : ContentPage
	{
        private Random random;

        public ThreeDie ()
        {
            random = new Random();
        }

        public void DisplayDice(StackLayout diceBox, int number)
        {
            diceBox.Children.Clear();

            string dots = GetDiceDots(number);

            Label diceLabel = new Label
            {
                Text = dots,
                FontFamily = "Monospace",
                HorizontalOptions = LayoutOptions.Center,
                VerticalOptions = LayoutOptions.Center,
                FontSize = 14,
                TextColor = Color.Black,
                LineBreakMode = LineBreakMode.WordWrap
            };

            diceBox.Children.Add(diceLabel);
        }

        public void DisplayStarOrBlank(StackLayout diceBox, bool showStar)
        {
            diceBox.Children.Clear();
            Label specialLabel = new Label
            {
                Text = showStar ? "★" : "",
                HorizontalOptions = LayoutOptions.Center,
                VerticalOptions = LayoutOptions.Center,
                FontSize = 28,
                TextColor = Color.Black
            };
            diceBox.Children.Add(specialLabel);
        }

        private string GetDiceDots(int number)
        {
            switch (number)
            {
                case 1:
                    return "     \n  •  \n     "; 
                case 2:
                    return "•    \n     \n    •"; 
                case 3:
                    return "•    \n  •  \n    •"; 
                case 4:
                    return " • • \n     \n • • "; 
                case 5:
                    return "•   •\n  •  \n•   •"; 
                case 6:
                    return "• • •\n     \n• • •"; 
                default:
                    return "";
            }
        }
    }
}