export type IReadingsResponse = {
	id: number;
	temperatureBmp: number;
	temperatureDht: number;
	pressureBmp: number;
	humidityDht: number;
	createdAt: string;
}[];
