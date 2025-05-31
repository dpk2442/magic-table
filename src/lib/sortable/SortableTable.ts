import Column from './Column.ts';
import Row from './Row.ts';
import { SortOrder, SortType } from './SortableTypes.ts';
import type { MagicTableSortInfo } from '../MagicTable.ts';

function parseSortType(unparsedSortType: string): SortType {
    switch (unparsedSortType) {
        case 'date':
            return { type: 'date' };
        case 'string':
            return { type: 'string' };
        case 'natural':
            return { type: 'natural' };
        case 'number':
            return { type: 'number' };
        default:
            if (unparsedSortType.startsWith('custom:')) {
                const customFunctionName = unparsedSortType.substring(7);
                if (!customFunctionName) {
                    throw new Error('Custom function name cannot be empty');
                }

                return {
                    type: 'custom',
                    data: { customFunctionName },
                };
            }

            return { type: null };
    }
}

export default class SortableTable {
    private columns;

    private columnIdMap;

    private columnSortButtons: Array<{
        button: HTMLButtonElement;
        sortOrder: SortOrder;
        columnIndex: number;
    }> = [];

    private tbody;

    private rows;

    private sortInfo: MagicTableSortInfo | undefined;

    constructor(table: HTMLTableElement) {
        const columnHeaders =
            table.querySelectorAll<HTMLTableCellElement>('thead th');
        this.columns = new Array<Column<any>>(columnHeaders.length);
        this.columnIdMap = new Map<string, number>();
        columnHeaders.forEach((columnHeader, i) => {
            let sortType: SortType = { type: null };
            if (columnHeader.dataset.mtSortable) {
                sortType = parseSortType(columnHeader.dataset.mtSortable);
                columnHeader
                    .querySelectorAll<HTMLButtonElement>('button[data-mt-sort]')
                    .forEach(button => {
                        let sortOrder: SortOrder = null;
                        switch (button.dataset.mtSort) {
                            case 'asc':
                                sortOrder = 'asc';
                                break;
                            case 'desc':
                                sortOrder = 'desc';
                                break;
                            default:
                        }

                        this.columnSortButtons.push({
                            button,
                            sortOrder,
                            columnIndex: i,
                        });
                    });
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

        this.sortInfo = undefined;
    }

    get sortButtons() {
        return this.columnSortButtons;
    }

    get currentSortInfo() {
        return this.sortInfo;
    }

    sortByColumn(column: number | string, sortOrder: SortOrder): boolean {
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
                    } else {
                        return false;
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

        const sortCoefficient = columnToSort.sortOrder === 'desc' ? -1 : 1;
        this.rows.sort(
            (a, b) =>
                sortCoefficient *
                columnToSort.sortFunction!(
                    a.getParsedValue(columnId),
                    b.getParsedValue(columnId),
                ),
        );

        this.tbody.append(...this.rows.map(row => row.element));

        this.sortInfo = {
            columnIndex: columnId,
            header: columnToSort.headerElement,
            sortOrder: columnToSort.sortOrder,
        };

        return true;
    }

    clearSort() {
        for (const column of this.columns) {
            column.sortOrder = null;
        }

        this.rows.sort((a, b) => a.originalIndex - b.originalIndex);
        this.tbody.append(...this.rows.map(row => row.element));

        this.sortInfo = undefined;
    }
}
