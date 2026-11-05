using System.Diagnostics.CodeAnalysis;
using Android.App;
using Android.Content.PM;

namespace DiceyDelight
{
    [SuppressMessage("ReSharper", "UnusedType.Global")]
    [Activity(Theme = "@style/Maui.SplashTheme", MainLauncher = true, Label = "Dicey Delight", ConfigurationChanges = ConfigChanges.ScreenSize | ConfigChanges.Orientation | ConfigChanges.UiMode | ConfigChanges.ScreenLayout | ConfigChanges.SmallestScreenSize | ConfigChanges.Density)]
    public class MainActivity : MauiAppCompatActivity;
}
