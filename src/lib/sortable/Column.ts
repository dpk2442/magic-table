import { SortOrder, SortType } from './SortableTypes.ts';

const SORTABLE_CLASS = 'mt-sortable';
const SORTED_ASC_CLASS = 'mt-sorted-asc';
const SORTED_DESC_CLASS = 'mt-sorted-desc';

const getStringSorter = (() => {
    let sorter: Intl.Collator | null = null;
    return () => {
        if (!sorter) {
            sorter = new Intl.Collator();
        }

        return sorter!.compare;
    };
})();

const getNaturalSoter = (() => {
    let sorter: Intl.Collator | null = null;
    return () => {
        if (!sorter) {
            sorter = new Intl.Collator(undefined, {
                numeric: true,
                sensitivity: 'base',
            });
        }

        return sorter!.compare;
    };
})();

export default class Column<T extends Date | number | string> {
    private currentSortOrder: SortOrder;

    private header;

    public readonly sortFunction;

    public readonly parseCellValue;

    private constructor(
        header: HTMLTableCellElement,
        sortFunction: ((a: T, b: T) => number) | null,
        parseCellValue: (value: string) => T,
    ) {
        this.currentSortOrder = null;
        this.header = header;
        this.sortFunction = sortFunction;
        this.parseCellValue = parseCellValue;

        if (sortFunction) {
            header.classList.add(SORTABLE_CLASS);
        }
    }

    get sortOrder() {
        return this.currentSortOrder;
    }

    set sortOrder(sortOrder: SortOrder) {
        this.currentSortOrder = sortOrder;
        this.header.classList.toggle(SORTED_ASC_CLASS, sortOrder === 'asc');
        this.header.classList.toggle(SORTED_DESC_CLASS, sortOrder === 'desc');
    }

    static create(header: HTMLTableCellElement, sortType: SortType) {
        switch (sortType) {
            case 'date':
                return new Column<Date>(
                    header,
                    (a, b) => a.getTime() - b.getTime(),
                    value => new Date(value),
                );
            case 'number':
                return new Column<number>(
                    header,
                    (a, b) => a - b,
                    value => parseFloat(value),
                );
            case 'string':
                return new Column<string>(
                    header,
                    (a, b) => getStringSorter()(a, b),
                    value => value,
                );
            case 'natural':
                return new Column<string>(
                    header,
                    (a, b) => getNaturalSoter()(a, b),
                    value => value,
                );
            default:
                return new Column<string>(header, null, value => value);
        }
    }
}
