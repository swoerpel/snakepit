import { createFeatureSelector, createSelector } from "@ngrx/store";
import { GridLayer } from "./studio.models";
import { StudioState } from "./studio.reducer";

const studioFeatureState = createFeatureSelector<StudioState>('studio');

export const getGridLayers = createSelector(
  studioFeatureState,
  (state: StudioState): GridLayer[] => state.layers
)

export const getSelectedLayerIndex = createSelector(
  studioFeatureState,
  (state: StudioState): number => state.selectedLayerIndex
)

export const getSelectedLayer = createSelector(
  studioFeatureState,
  getSelectedLayerIndex,
  (state: StudioState, index: number): GridLayer => state.layers.find(layer => layer.index === index)
)


