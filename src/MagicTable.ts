export default class MagicTable extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' }).innerHTML = `
            <style>
                :host {
                    display: block;
                }
            </style>
            <slot></slot>
        `;
    }
}
