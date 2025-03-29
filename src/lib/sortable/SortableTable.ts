import Column from './Column.ts';
import Row from './Row.ts';
import { SortOrder, SortType } from './SortableTypes.ts';
import type { MagicTableSortInfo } from '../MagicTable.ts';

const SORT_TYPE_MAPPING: { [_: string]: SortType } = {
    date: 'date',
    string: 'string',
    natural: 'natural',
    number: 'number',
};

export default class SortableTable {
    private columns;

    private columnIdMap;

    private tbody;

    private rows;

    private sortInfo: MagicTableSortInfo | null;

    constructor(table: HTMLTableElement) {
        const columnHeaders =
            table.querySelectorAll<HTMLTableCellElement>('thead th');
        this.columns = new Array<Column<any>>(columnHeaders.length);
        this.columnIdMap = new Map<string, number>();
        columnHeaders.forEach((columnHeader, i) => {
            let sortType: SortType = null;
            if (columnHeader.dataset.mtSortable) {
                sortType = SORT_TYPE_MAPPING[columnHeader.dataset.mtSortable];
            }

            this.columns[i] = Column.create(columnHeader, sortType);
            if (columnHeader.id) {
                this.columnIdMap.set(columnHeader.id, i);
            }
        });

        this.tbody = table.querySelector<HTMLTableSectionElement>('tbody')!;
        this.rows = Array.from(
            this.tbody.querySelectorAll<HTMLTableRowElement>('tr'),
            (row, i) => new Row(this.columns, row, i),
        );

        this.sortInfo = null;
    }

    get currentSortInfo() {
        return this.sortInfo;
    }

    sortByColumn(
        column: number | string,
        sortOrder: SortOrder,
    ): MagicTableSortInfo {
        let columnId: number;
        if (typeof column === 'string') {
            const i = this.columnIdMap.get(column);
            if (!i) {
                throw new Error('Invalid column id for sorting');
            }
            columnId = i;
        } else {
            columnId = column;
        }

        if (columnId < 0 || columnId >= this.columns.length) {
            throw new Error('Invalid column id for sorting');
        }

        const columnToSort = this.columns[columnId];
        if (columnToSort.sortFunction === null) {
            throw new Error('Specified column is not sortable');
        }

        for (const col of this.columns) {
            if (col === columnToSort) {
                if (sortOrder) {
                    if (col.sortOrder !== sortOrder) {
                        col.sortOrder = sortOrder;
                    }
                } else if (col.sortOrder === 'asc') {
                    col.sortOrder = 'desc';
                } else {
                    col.sortOrder = 'asc';
                }
            } else {
                col.sortOrder = null;
            }
        }

        this.rows.sort((a, b) =>
            columnToSort.sortFunction!(
                a.getParsedValue(columnId),
                b.getParsedValue(columnId),
            ),
        );

        if (columnToSort.sortOrder === 'desc') {
            this.rows.reverse();
        }

        this.tbody.append(...this.rows.map(row => row.element));

        this.sortInfo = {
            columnIndex: columnId,
            header: columnToSort.headerElement,
            sortOrder: columnToSort.sortOrder,
        };

        return this.sortInfo;
    }

    clearSort() {
        for (const column of this.columns) {
            column.sortOrder = null;
        }

        this.rows.sort((a, b) => a.originalIndex - b.originalIndex);
        this.tbody.append(...this.rows.map(row => row.element));

        this.sortInfo = null;
    }
}
