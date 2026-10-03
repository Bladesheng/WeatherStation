export type IReading = {
	id: number;
	temperatureBmp: number;
	temperatureDht: number;
	temperatureAvg: number;
	pressureBmp: number;
	humidityDht: number;
	createdAt: Date;
};
