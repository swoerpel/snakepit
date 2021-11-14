import { Injectable } from "@angular/core";
import { Actions } from "@ngrx/effects";
import { Store } from "@ngrx/store";

@Injectable({
    providedIn: 'root'
})
export class StudioEffects {

    constructor( 
        private actions$: Actions,
        private store: Store,
    ){ }

    // getOrders$ = createEffect(() => this.actions$.pipe(
    //     ofType(OrderActions.GetOrders),
    //     switchMap(() => this.orderApiService.getOrders().pipe(
    //         map((orders: Order[]) => OrderActions.GetOrdersSuccess({orders})),
    //         catchError((error) => of(OrderActions.GetOrdersError({error}))),
    //     ))
    // ));


}
