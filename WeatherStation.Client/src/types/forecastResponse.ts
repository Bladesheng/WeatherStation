export type IForecastResponse = {
	forecast: IForecastEntry[];
	sunMoon: ISunMoonEntry[];
};

type IForecastEntry = {
	data: IForecastData;
	time: string;
};

type ISunMoonEntry = {
	date: string;
	moonPhase: number;
	sunrise: string;
	sunset: string;
};

type IForecastData = {
	instant: {
		details: IInstantDetails;
	};
	next_12_hours: ITimeRange;
	next_1_hours: ITimeRange;
	next_6_hours: ITimeRange;
};

type IInstantDetails = {
	air_pressure_at_sea_level: number;
	air_temperature: number;
	cloud_area_fraction: number;
	relative_humidity: number;
	wind_from_direction: number;
	wind_speed: number;
};

type ITimeRange = {
	details: IPrecipitationDetails;
	summary: ISummary;
} | null;

type ISummary = {
	symbol_code: string;
};

type IPrecipitationDetails = {
	precipitation_amount: number | null;
};
