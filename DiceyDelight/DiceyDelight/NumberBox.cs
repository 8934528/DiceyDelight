using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using Xamarin.Forms;

namespace DiceyDelight
{
	public class NumberBox : StackLayout
    {
        public NumberBox(string number)
        {
            Orientation = StackOrientation.Vertical;
            BackgroundColor = Color.LightBlue;
            Padding = 5;
            HorizontalOptions = LayoutOptions.Center;
            VerticalOptions = LayoutOptions.Center;

            Label label = new Label
            {
                Text = number,
                FontSize = 24,
                HorizontalOptions = LayoutOptions.Center,
                VerticalOptions = LayoutOptions.Center
            };

            Children.Add(label);

            HeightRequest = 40; 
            WidthRequest = 40; 
        }
    }
}