export type GpxPoint = {
  lat: number;
  lon: number;
  time: Date;
  elevation?: number;
  speed?: number;
};

export type Lap = {
  id: string;
  name: string;
  driver: string;  
  date: string;    
  points: GpxPoint[];
  color: string;
};