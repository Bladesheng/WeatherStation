namespace WeatherStation.Api.Features.Readings;

public static class Lttb
{
    // Usually, there are ~8000 readings per month.
    // With that many points, the browser starts to lag when rendering the chart.
    // 1000 readings seems to be a nice compromise between browser lag and data resolution.
    private const int DownsampledCount = 1000;

    /// <summary>
    /// Largest Triangle Three Buckets.
    /// For an explanation of the algorithm see: https://skemman.is/bitstream/1946/15343/3/SS_MSthesis.pdf
    /// </summary>
    public static List<Reading> Downsample(List<Reading> data)
    {
        var dataLength = data.Count;
        if (DownsampledCount >= dataLength || DownsampledCount == 0) return data;

        var downsampledData = new List<Reading>(DownsampledCount);

        // Size of each bucket - leave room for start and end data points.
        var bucketSize = (double)(dataLength - 2) / (DownsampledCount - 2);

        // Point that was selected in the previous bucket.
        // Initially, it's the first point of data because the first bucket contains only 1 point.
        var pointA = 0;

        // First bucket always contains only the first point.
        downsampledData.Add(data[pointA]);

        for (var currentDataIndex = 0; currentDataIndex < DownsampledCount - 2; currentDataIndex++)
        {
            // Previous bucket.
            var pointAX = (double)data[pointA].CreatedAt.Ticks;
            var pointAY = data[pointA].TemperatureBmp;

            // Current bucket.
            var currentBucketStart = (int)Math.Floor((currentDataIndex + 0) * bucketSize) + 1;
            var currentBucketEnd = (int)Math.Floor((currentDataIndex + 1) * bucketSize) + 1;

            var currentBucket = data[currentBucketStart..currentBucketEnd];

            // Next bucket.
            var nextBucketStart = (int)Math.Floor((currentDataIndex + 1) * bucketSize) + 1;
            var nextBucketEnd = (int)Math.Floor((currentDataIndex + 2) * bucketSize) + 1;
            // NextBucketEnd shouldn't exceed length of the data.
            nextBucketEnd = nextBucketEnd < dataLength ? nextBucketEnd : dataLength;

            var nextBucket = data[nextBucketStart..nextBucketEnd];

            // Calculate average x and y values from all points in the next bucket.
            // Point C is located at the average x and y values.
            var pointCX = nextBucket.Average(r => (double)r.CreatedAt.Ticks);
            var pointCY = nextBucket.Average(r => r.TemperatureBmp);

            // Point B is the point that will make the largest triangle when you connect points A, B and C.
            // Loop over all points in the current bucket and return the point that yields the largest triangle.
            // That point (B) will later become point A.
            var maxArea = -1.0;
            var pointBData = currentBucket[0];
            var nextA = currentDataIndex;

            for (var currentBucketDataIndex = 0;
                 currentBucketDataIndex < currentBucket.Count;
                 currentBucketDataIndex++)
            {
                var pointBX = (double)currentBucket[currentBucketDataIndex].CreatedAt.Ticks;
                var pointBY = currentBucket[currentBucketDataIndex].TemperatureBmp;

                // Area of the current triangle (created by connecting points A, B and C).
                var area = Math.Abs(
                    (pointAX - pointCX) * (pointBY - pointAY) -
                    (pointAX - pointBX) * (pointCY - pointAY)
                ) * 0.5;

                // Save values only if area was bigger than previous maximum.
                if (area > maxArea)
                {
                    var pointBIndex = currentBucketStart + currentBucketDataIndex;
                    maxArea = area;
                    pointBData = currentBucket[currentBucketDataIndex];
                    nextA = pointBIndex;
                }
            }

            // Save point B from this bucket.
            downsampledData.Add(pointBData);

            // Next point A will be current point B.
            pointA = nextA;
        }

        // Last bucket always contains only the last point.
        downsampledData.Add(data[dataLength - 1]);

        return downsampledData;
    }
}