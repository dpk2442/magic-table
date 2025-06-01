import SortableTable from './sortable/SortableTable.ts';
import { SortOrder } from './sortable/SortableTypes.ts';

interface MagicTableSortInfo {
    columnIndex: number;
    header: HTMLTableCellElement;
    sortOrder: SortOrder;
}

export type { MagicTableSortInfo };

export default class MagicTable extends HTMLElement {
    private sortableTable: null | SortableTable;

    constructor() {
        super();
        this.sortableTable = null;
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

        if (this.hasAttribute('overflow-classes')) {
            this.setupOverflowClasses();
        }

        if (this.hasAttribute('sortable')) {
            this.setupSortable(table);
        }
    }

    get currentSortInfo() {
        return this.sortableTable?.currentSortInfo;
    }

    sortByColumn(column: number | string, sortOrder: SortOrder = null) {
        if (!this.sortableTable) {
            throw new Error('Table is not enabled for sorting');
        }

        if (this.sortableTable.sortByColumn(column, sortOrder)) {
            this.dispatchEvent(
                new CustomEvent<MagicTableSortInfo>('mtsorted', {
                    bubbles: true,
                    cancelable: true,
                    detail: this.sortableTable.currentSortInfo,
                }),
            );
        }
    }

    clearSort() {
        if (!this.sortableTable) {
            throw new Error('Table is not enabled for sorting');
        }

        this.sortableTable.clearSort();
        this.dispatchEvent(
            new CustomEvent('mtsortcleared', {
                bubbles: true,
                cancelable: true,
            }),
        );
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
        thead.style.translate = '0 0';

        // Compute initial thead offset
        const initialTheadTop = thead.getBoundingClientRect().top;
        const initialMagicTableTop = this.getBoundingClientRect().top;
        const initialOffset = initialTheadTop - initialMagicTableTop;

        // Set up scroll handler based sticky header
        const scrollHandler = () => {
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
                thead.style.translate = '0 0';
                return;
            }

            // The top of the magic table is off the top of the screen, adjust the thead offset accordingly
            const offset = -magicTableRect.top - initialOffset;
            if (offset + theadRect.height > magicTableRect.height) {
                thead.style.translate = `0 ${magicTableRect.height - theadRect.height}px`;
            } else {
                thead.style.translate = `0 ${offset}px`;
            }
        };

        scrollHandler();

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

    private setupOverflowClasses() {
        const computeOverflowClasses = () => {
            const hasVerticalOverflow = this.offsetHeight < this.scrollHeight;
            const isAtTop = hasVerticalOverflow && this.scrollTop === 0;
            const isAtBottom =
                this.scrollTop >= this.scrollHeight - this.clientHeight;
            const hasHorizontalOverflow = this.offsetWidth < this.scrollWidth;
            const isAtLeft = hasHorizontalOverflow && this.scrollLeft === 0;
            const isAtRight =
                this.scrollLeft >= this.scrollWidth - this.clientWidth;

            // These classes let the consumer know there is overflow
            /* eslint-disable wc/no-self-class */
            this.classList.toggle(
                'mt-overflow-top',
                hasVerticalOverflow && !isAtTop,
            );
            this.classList.toggle(
                'mt-overflow-bottom',
                hasVerticalOverflow && !isAtBottom,
            );
            this.classList.toggle(
                'mt-overflow-left',
                hasHorizontalOverflow && !isAtLeft,
            );
            this.classList.toggle(
                'mt-overflow-right',
                hasHorizontalOverflow && !isAtRight,
            );
            /* eslint-enable wc/no-self-class */
        };

        this.addEventListener('scroll', computeOverflowClasses);
        computeOverflowClasses();
    }

    private setupSortable(table: HTMLTableElement) {
        this.sortableTable = new SortableTable(table);
        this.sortableTable.sortButtons.forEach(
            ({ button, columnIndex, sortOrder }) => {
                button.addEventListener('click', () => {
                    this.sortByColumn(columnIndex, sortOrder);
                });
            },
        );
    }
}
