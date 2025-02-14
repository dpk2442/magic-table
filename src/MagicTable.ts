export default class MagicTable extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' }).innerHTML = `
            <style>
                :host {
                    display: block;
                    position: relative;
                }
            </style>
            <slot></slot>
        `;
    }

    public connectedCallback() {
        const table = this.querySelector('table');
        if (!table) {
            throw new Error('MagicTable does not contain a table!');
        }

        if (this.hasAttribute('sticky-header')) {
            this.setupStickyHeader(table);
        }
    }

    private setupStickyHeader(table: HTMLTableElement) {
        const thead = table.querySelector('thead');
        if (!thead) {
            throw new Error(
                'MagicTable does not have a thead for sticky-header',
            );
        }

        // Make table header sticky
        thead.style.position = 'sticky';
        thead.style.top = '0';

        // Set up scroll handler based sticky header
        const scrollHandler = () => {
            window.requestAnimationFrame(() => {
                const theadRect = thead.getBoundingClientRect();

                // If thead is at the top of the viewport, no need to adjust
                if (theadRect.top === 0) {
                    return;
                }

                const magicTableRect = this.getBoundingClientRect();

                // If the top of the magic table is visible, setting top to 0 will position the thead correctly
                if (magicTableRect.top >= 0) {
                    thead.style.top = '0';
                    return;
                }

                // The top of the magic table is off the top of the screen, adjust the thead offset accordingly
                const offset = -magicTableRect.top;
                if (offset + theadRect.height > magicTableRect.height) {
                    thead.style.top = `${magicTableRect.height - theadRect.height}px`;
                } else {
                    thead.style.top = `${offset}px`;
                }
            });
        };

        const intersectionObserver = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (
                        entry.intersectionRatio > 0 &&
                        entry.intersectionRatio < 1 &&
                        entry.isIntersecting
                    ) {
                        window.addEventListener('scroll', scrollHandler);
                    } else {
                        window.removeEventListener('scroll', scrollHandler);
                        thead.style.top = '0';
                    }
                });
            },
            {
                threshold: [0, 1],
            },
        );
        intersectionObserver.observe(table);
    }
}
