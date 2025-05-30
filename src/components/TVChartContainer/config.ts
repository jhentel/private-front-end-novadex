import {
  ChartingLibraryWidgetOptions,
  LanguageCode,
  ResolutionString,
} from "@/types/charting_library";
import {
  formatChartPrice,
  getIntervalResolution,
} from "@/utils/trading-view/trading-view-utils";

export const createWidgetOptions = (
  container: HTMLElement,
  mint: string,
  datafeed: any,
): ChartingLibraryWidgetOptions => ({
  debug: false,
  symbol: mint,
  interval: getIntervalResolution(),
  time_frames: [
    { text: "3m", resolution: "60" as ResolutionString },
    { text: "1m", resolution: "30" as ResolutionString },
    { text: "5d", resolution: "5" as ResolutionString },
    { text: "1d", resolution: "1" as ResolutionString },
  ],
  container: container || document.querySelector("#trading-view"),
  load_last_chart: true,
  fullscreen: false,
  autosize: true,
  library_path: "/static/charting_library/",
  locale: "en" as LanguageCode,
  enabled_features: [
    "timeframes_toolbar",
    "symbol_search_hot_key",
    "left_toolbar",
    "display_market_status",
    "seconds_resolution",
    "two_character_bar_marks_labels",
  ],
  disabled_features: [
    "study_templates",
    "header_symbol_search",
    "header_compare",
    "header_saveload",
    "header_quick_search",
    "symbol_search_hot_key",
    "symbol_info",
    "edit_buttons_in_legend",
  ],
  settings_adapter: {
    initialSettings: {
      defaultInterval: getIntervalResolution(),
      custom_font_family: "'Geist', sans-serif",
    },
    setValue: function (key, value) {},
    removeValue: function (key) {},
  },
  custom_font_family: "'Geist', sans-serif",
  custom_css_url: "../themed.css",
  overrides: {
    volumePaneSize: "large",
    "scalesProperties.fontSize": 11,
    "scalesProperties.textColor": "#FFFFFF",

    "paneProperties.legendProperties.showLegend": true,
    "paneProperties.legendProperties.showVolume": true,
    "paneProperties.legendProperties.showSeriesOHLC": true,
    "paneProperties.backgroundType": "solid",
    "paneProperties.background": "#080812",
    "paneProperties.vertGridProperties.color": "#1a1a2e",
    "paneProperties.horzGridProperties.color": "#1a1a2e",

    "mainSeriesProperties.candleStyle.upColor": "#8CD9B6",
    "mainSeriesProperties.candleStyle.downColor": "#F65B93",
    "mainSeriesProperties.candleStyle.borderUpColor": "#8CD9B6",
    "mainSeriesProperties.candleStyle.borderDownColor": "#F65B93",
    "mainSeriesProperties.candleStyle.wickUpColor": "#8CD9B6",
    "mainSeriesProperties.candleStyle.wickDownColor": "#F65B93",
  },
  studies_overrides: {
    "volume.volume.color.0": "#F65B93",
    "volume.volume.color.1": "#8CD9B6",
  },
  loading_screen: {
    backgroundColor: "#080812",
    foregroundColor: "#080812",
  },
  custom_formatters: {
    priceFormatterFactory: () => ({
      format: formatChartPrice,
    }),
    studyFormatterFactory: () => ({
      format: formatChartPrice,
    }),
  },
  theme: "dark",
  datafeed,
});
