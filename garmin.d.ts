type HeartRateMsg = { timestamp16: number, heartRate: number }

type IntensityMsg = {
    timestamp: string,
    currentActivityTypeIntensity: unknown[],
    activityType: number,
    intensity: number
}

type ActivityMsg = {
    timestamp: string,
    distance: number,
    cycles: number,
    activeTime: number,
    activeCalories: number,
    durationMin: number,
    activityType: 'running' | 'walking' | 'generic',
    steps?: number
}

declare module "@garmin-fit/sdk" {
    export class Stream {
        public static fromByteArray(bytes: number[]): Stream
        public static fromBuffer(buffer: Buffer): Stream
        public static fromArrayBuffer(uint8Array: Uint8Array): Stream
    }

    export class Decoder {
        constructor(stream: Stream)

        isFIT(stream: Stream): boolean
        read(): {
            messages: {
                fileIdMesgs: {
                    serialNumber: number,
                    timeCreated: string,
                    manufacturer: string,
                    product: number,
                    number: number,
                    type: string,
                    garminProduct: string
                }[],
                deviceInfoMesgs: {
                    timestamp: string,
                    serialNumber: number,
                    manufacturer: string,
                    product: number,
                    softwareVersion: number,
                    garminProduct: string
                }[],
                softwareMesgs: { version: number }[],
                monitoringInfoMesgs: unknown[],
                monitoringMesgs: (HeartRateMsg | IntensityMsg | ActivityMsg)[]
            },
            errors: unknown
        }
    }
}