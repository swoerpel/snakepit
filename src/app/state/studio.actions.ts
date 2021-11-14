import { createAction, props } from "@ngrx/store";
import { Dims } from "../shared/models";
import {  GridAlgorithm } from "./studio.models";


export const SetSelectedLayerIndex = createAction(
    '[Studio] Set Selected Layer Index', 
    props<{ index: number; }>()
);
export const AddNewLayer = createAction(
    '[Studio] Add New Layer', 
);

export const SetSelectedLayerGridAlgorithm = createAction(
    '[Studio] Update Selected Layer Grid Algorithm', 
    props<{ algorithm: GridAlgorithm; }>()
);

export const SetSelectedLayerOpacity = createAction(
    '[Studio] Update Selected Layer Grid Opacity', 
    props<{ opacity: number; }>()
);
export const SetSelectedLayerDisplay = createAction(
    '[Studio] Set Selected Layer Display', 
    props<{ display: boolean; }>()
);
export const SetSelectedLayerDims = createAction(
    '[Studio] Set Selected Layer Dims', 
    props<{ dims: Dims; }>()
);
export const SetSelectedLayerMaxValue = createAction(
    '[Studio] Set Selected Layer Max Value', 
    props<{ maxValue: number; }>()
);
export const SetSelectedLayerPalette = createAction(
    '[Studio] Set Selected Layer Palette', 
    props<{ colorPalette: string; }>()
);
export const SetSelectedLayerActiveColors = createAction(
    '[Studio] Set Selected Layer Active Colors', 
    props<{ activeColors: string[]; }>()
);



