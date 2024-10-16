import { Component } from "@angular/core";

@Component({
    selector: 'app-spinner',
    standalone: true,
    imports: [],
    template: '<div class="lds-ring"><div></div><div></div><div></div><div></div></div>',
    styleUrl: './spinner.component.css'
})

export class SpinnerComponent {
    
}