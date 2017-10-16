import { TABLE_DATA_TYPE } from '../table-view/constants';
import { TABLE_GROUP_TYPE } from './constants';
import {
  tableColumnsWithGrouping,
  tableRowsWithGrouping,
} from './computeds';

describe('TableGroupRow Plugin computeds', () => {
  describe('#tableColumnsWithGrouping', () => {
    const tableColumns = [
      { type: 'undefined', column: { name: 'a' } },
      { type: TABLE_DATA_TYPE, column: { name: 'a' } },
      { type: TABLE_DATA_TYPE, column: { name: 'b' } },
      { type: TABLE_DATA_TYPE, column: { name: 'c' } },
      { type: TABLE_DATA_TYPE, column: { name: 'd' } },
    ];
    const grouping = [
      { columnName: 'a' },
      { columnName: 'c' },
    ];

    it('should work', () => {
      expect(tableColumnsWithGrouping(tableColumns, grouping, grouping, 123, () => false))
        .toEqual([
          {
            key: `${TABLE_GROUP_TYPE}_a`, type: TABLE_GROUP_TYPE, column: { name: 'a' }, width: 123,
          },
          {
            key: `${TABLE_GROUP_TYPE}_c`, type: TABLE_GROUP_TYPE, column: { name: 'c' }, width: 123,
          },
          { type: 'undefined', column: { name: 'a' } },
          { type: TABLE_DATA_TYPE, column: { name: 'b' } },
          { type: TABLE_DATA_TYPE, column: { name: 'd' } },
        ]);
    });

    it('should not remove column when grouping', () => {
      const draftGrouping = [
        { columnName: 'a' },
        { columnName: 'c', draft: true, mode: 'add' },
      ];
      expect(tableColumnsWithGrouping(tableColumns, grouping, draftGrouping, 123, () => false))
        .toEqual([
          {
            key: `${TABLE_GROUP_TYPE}_a`, type: TABLE_GROUP_TYPE, column: { name: 'a' }, width: 123,
          },
          {
            key: `${TABLE_GROUP_TYPE}_c`, type: TABLE_GROUP_TYPE, column: { name: 'c' }, width: 123,
          },
          { type: 'undefined', column: { name: 'a' } },
          { type: TABLE_DATA_TYPE, column: { name: 'b' } },
          { type: TABLE_DATA_TYPE, column: { name: 'c' }, draft: true },
          { type: TABLE_DATA_TYPE, column: { name: 'd' } },
        ]);
    });

    it('should add a draft column when ungrouping', () => {
      const draftGrouping = [
        { columnName: 'a' },
        { columnName: 'c', draft: true, mode: 'remove' },
      ];
      expect(tableColumnsWithGrouping(tableColumns, grouping, draftGrouping, 123, () => false))
        .toEqual([
          {
            key: `${TABLE_GROUP_TYPE}_a`, type: TABLE_GROUP_TYPE, column: { name: 'a' }, width: 123,
          },
          {
            key: `${TABLE_GROUP_TYPE}_c`, type: TABLE_GROUP_TYPE, column: { name: 'c' }, width: 123,
          },
          { type: 'undefined', column: { name: 'a' } },
          { type: TABLE_DATA_TYPE, column: { name: 'b' } },
          { type: TABLE_DATA_TYPE, column: { name: 'c' }, draft: true },
          { type: TABLE_DATA_TYPE, column: { name: 'd' } },
        ]);
    });

    it('should add a draft column when reordering groups', () => {
      const draftGrouping = [
        { columnName: 'a' },
        { columnName: 'c', draft: true, mode: 'reorder' },
      ];
      expect(tableColumnsWithGrouping(tableColumns, grouping, draftGrouping, 123, () => false))
        .toEqual([
          {
            key: `${TABLE_GROUP_TYPE}_a`, type: TABLE_GROUP_TYPE, column: { name: 'a' }, width: 123,
          },
          {
            key: `${TABLE_GROUP_TYPE}_c`, type: TABLE_GROUP_TYPE, column: { name: 'c' }, width: 123,
          },
          { type: 'undefined', column: { name: 'a' } },
          { type: TABLE_DATA_TYPE, column: { name: 'b' } },
          { type: TABLE_DATA_TYPE, column: { name: 'd' } },
        ]);
    });

    it('can keep grouped columns in table', () => {
      expect(tableColumnsWithGrouping(tableColumns, grouping, grouping, 123, columnName => columnName === 'c'))
        .toEqual([
          {
            key: `${TABLE_GROUP_TYPE}_a`, type: TABLE_GROUP_TYPE, column: { name: 'a' }, width: 123,
          },
          {
            key: `${TABLE_GROUP_TYPE}_c`, type: TABLE_GROUP_TYPE, column: { name: 'c' }, width: 123,
          },
          { type: 'undefined', column: { name: 'a' } },
          { type: TABLE_DATA_TYPE, column: { name: 'b' } },
          { type: TABLE_DATA_TYPE, column: { name: 'c' } },
          { type: TABLE_DATA_TYPE, column: { name: 'd' } },
        ]);
    });
  });

  describe('#tableRowsWithGrouping', () => {
    it('should convert table rows containing group data to group rows', () => {
      const tableRows = [
        { type: TABLE_DATA_TYPE, row: { group: true, groupedBy: 'a', key: 'B' } },
        { type: TABLE_DATA_TYPE, row: { id: 0 } },
        { type: TABLE_DATA_TYPE, row: { id: 1 } },
        { type: TABLE_DATA_TYPE, row: { id: 2 } },
      ];
      const isGroupRow = row => row.group;

      expect(tableRowsWithGrouping(tableRows, isGroupRow))
        .toEqual([
          {
            key: `${TABLE_GROUP_TYPE}_B`,
            type: TABLE_GROUP_TYPE,
            row: { group: true, groupedBy: 'a', key: 'B' },
            colSpanStart: `${TABLE_GROUP_TYPE}_a`,
          },
          { type: TABLE_DATA_TYPE, row: { id: 0 } },
          { type: TABLE_DATA_TYPE, row: { id: 1 } },
          { type: TABLE_DATA_TYPE, row: { id: 2 } },
        ]);
    });

    // TODO: remove with custom grouping release
    it('should convert table rows containing group data to group rows in legacy mode', () => {
      const tableRows = [
        { type: TABLE_DATA_TYPE, row: { type: 'groupRow', groupedBy: 'a', key: 'B' } },
        { type: TABLE_DATA_TYPE, row: { id: 0 } },
        { type: TABLE_DATA_TYPE, row: { id: 1 } },
        { type: TABLE_DATA_TYPE, row: { id: 2 } },
      ];
      const isGroupRow = row => row.group;

      expect(tableRowsWithGrouping(tableRows, isGroupRow))
        .toEqual([
          {
            key: `${TABLE_GROUP_TYPE}_B`,
            type: TABLE_GROUP_TYPE,
            row: { type: 'groupRow', groupedBy: 'a', key: 'B' },
            colSpanStart: `${TABLE_GROUP_TYPE}_a`,
          },
          { type: TABLE_DATA_TYPE, row: { id: 0 } },
          { type: TABLE_DATA_TYPE, row: { id: 1 } },
          { type: TABLE_DATA_TYPE, row: { id: 2 } },
        ]);
    });
  });
});