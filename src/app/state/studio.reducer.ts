import { createReducer, on } from "@ngrx/store";
import { StudioActions } from ".";
import { GridAlgorithm, GridLayer } from "./studio.models";

function generateDefaultLayer(index: number = 0){
    return {
        index,
        display: true,
        opacity: 100,
        dims: {
            width: 4,
            height: 4,
        },
        algorithm: GridAlgorithm.Modulus,
        algorithmParams: {
            maxValue: 4,
        },
        colorPalette: 'Spectral',
        activeColors: ['#9e0142', '#d53e4f', '#f46d43', '#fdae61'],
    }
}


export interface StudioState{
    layers: GridLayer[];
    selectedLayerIndex: number;
}

const initialState: StudioState = {
    layers: [generateDefaultLayer()],
    selectedLayerIndex: 0,
}

export const studioReducer = createReducer(
    initialState,
    on(StudioActions.SetSelectedLayerIndex, (state: StudioState, {index}) => ({
        ...state,
        selectedLayerIndex: index,
    })),
    on(StudioActions.AddNewLayer, (state: StudioState) => ({
        ...state,
        layers: [...state.layers,generateDefaultLayer(state.layers.length)],
        selectedLayerIndex: state.layers.length,
    })),
    on(StudioActions.SetSelectedLayerGridAlgorithm, (state: StudioState, {algorithm}) => ({
        ...state,
        layers: state.layers.map((layer: GridLayer) => (layer.index === state.selectedLayerIndex) ? 
            {...layer,algorithm} : layer
        )
    })),
    on(StudioActions.SetSelectedLayerOpacity, (state: StudioState, {opacity}) => ({
        ...state,
        layers: state.layers.map((layer: GridLayer) => (layer.index === state.selectedLayerIndex) ? 
            {...layer,opacity} : layer
        )
    })),
    on(StudioActions.SetSelectedLayerDisplay, (state: StudioState, {display}) => ({
        ...state,
        layers: state.layers.map((layer: GridLayer) => (layer.index === state.selectedLayerIndex) ? 
            {...layer,display} : layer
        )
    })),
    on(StudioActions.SetSelectedLayerDims, (state: StudioState, {dims}) => ({
        ...state,
        layers: state.layers.map((layer: GridLayer) => (layer.index === state.selectedLayerIndex) ? 
            {...layer,dims} : layer
        )
    })),
    on(StudioActions.SetSelectedLayerMaxValue, (state: StudioState, {maxValue}) => ({
        ...state,
        layers: state.layers.map((layer: GridLayer) => (layer.index === state.selectedLayerIndex) ? 
            {...layer, algorithmParams: {...layer.algorithmParams,maxValue}} : layer
        )
    })),
    on(StudioActions.SetSelectedLayerPalette, (state: StudioState, {colorPalette}) => ({
        ...state,
        layers: state.layers.map((layer: GridLayer) => (layer.index === state.selectedLayerIndex) ? 
            {...layer, colorPalette} : layer
        )
    })),
    on(StudioActions.SetSelectedLayerActiveColors, (state: StudioState, {activeColors}) => ({
        ...state,
        layers: state.layers.map((layer: GridLayer) => (layer.index === state.selectedLayerIndex) ? 
            {...layer, activeColors} : layer
        )
    })),
    
);

