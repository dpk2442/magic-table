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

        // This class lets the consumer know the element is activated and has a scoped name, so ignore the linting rule
        // eslint-disable-next-line wc/no-self-class
        this.classList.add('mt-activated');

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

        // Add class to table header and make it sticky
        thead.classList.add('mt-sticky-header');
        thead.style.position = 'sticky';
        thead.style.top = '0';

        // Compute initial thead offset
        const initialTheadTop = thead.getBoundingClientRect().top;
        const initialMagicTableTop = this.getBoundingClientRect().top;
        const initialOffset = initialTheadTop - initialMagicTableTop;

        // Set up scroll handler based sticky header
        const scrollHandler = () => {
            window.requestAnimationFrame(() => {
                const theadRect = thead.getBoundingClientRect();

                // If thead is at the top of the viewport, no need to adjust
                if (theadRect.top === 0) {
                    return;
                }

                const magicTableRect = this.getBoundingClientRect();

                // If the bottom of the magic table is close enough that the thead is only partially visible, no need to adjust
                if (magicTableRect.bottom <= theadRect.height) {
                    return;
                }

                // If the top of the magic table is visible, setting top to 0 will position the thead correctly
                if (magicTableRect.top + initialOffset >= 0) {
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
