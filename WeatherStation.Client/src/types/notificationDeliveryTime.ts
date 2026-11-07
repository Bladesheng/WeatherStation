// days are .NET DayOfWeek / Date.getDay() numbers - 0 is Sunday
export type INotificationDeliveryTime = {
	id: number;
	sendAt: string;
	days: number[];
};
