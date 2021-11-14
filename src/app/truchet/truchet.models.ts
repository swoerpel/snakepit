import { Point, Rect } from "../shared/models";

  
export interface WingedTile{
  rect: Rect;
  corners: Point[];
  edges: Point[];
  cornerRadius: number;
  edgeRadius: number;
  straights: Point[][];
  curves: Point[][];
}

