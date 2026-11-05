using Microsoft.Extensions.Logging;
using DiceyDelight.Services;

namespace DiceyDelight
{
    public static class MauiProgram
    {
        public static MauiApp CreateMauiApp()
        {
            var builder = MauiApp.CreateBuilder();
            builder
                .UseMauiApp<App>()
                .ConfigureFonts(fonts =>
                {
                    fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
                    fonts.AddFont("FingerPaint-Regular.ttf", "FingerPaint");
                });

            builder.Services.AddMauiBlazorWebView();
            builder.Services.AddSingleton<DiceGameEngine>();

#if DEBUG
            builder.Services.AddBlazorWebViewDeveloperTools();
            builder.Logging.AddDebug();
#endif

            return builder.Build();
        }
    }
}
