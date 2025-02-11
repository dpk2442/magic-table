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
        this.style.overflowY = 'auto';

        const thead = table.querySelector('thead');
        if (!thead) {
            throw new Error(
                'MagicTable does not have a thead for sticky-header',
            );
        }

        // Use position sticky if there is no horizontal overflow
        if (this.clientWidth >= this.scrollWidth) {
            this.style.overflowY = '';
            thead.style.position = 'sticky';
            thead.style.top = '0';
            return;
        }

        // Set up scroll handler based sticky header
        const theadHeight = thead.getBoundingClientRect().height;
        thead.style.position = 'relative';
        thead.style.top = '0';

        const scrollHandler = () => {
            window.requestAnimationFrame(() => {
                const boundingClientRect = table.getBoundingClientRect();
                if (boundingClientRect.top > 0) {
                    thead.style.top = '0';
                } else {
                    const offset = -boundingClientRect.top;
                    if (offset + theadHeight > boundingClientRect.height) {
                        thead.style.top = `${boundingClientRect.height - theadHeight}px`;
                    } else {
                        thead.style.top = `${offset}px`;
                    }
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
