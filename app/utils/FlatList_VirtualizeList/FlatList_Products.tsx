// utils/CustomFlatList.tsx
import React from 'react';
import { FlatList, View } from 'react-native';

type Props = {
  data: any[];
  renderItem: ({ item }: any) => JSX.Element;
  keyExtractor: (item: any) => string;
  onEndReached?: () => void;
  onScroll?: (event: any) => void;
  onMomentumScrollBegin?: (event: any) => void;
  onMomentumScrollEnd?: (event: any) => void;
  listRef?: React.RefObject<FlatList<any>>;
};

const CustomFlatList = ({
  data,
  renderItem,
  keyExtractor,
  onEndReached,
  onScroll,
  onMomentumScrollBegin,
  onMomentumScrollEnd,
  listRef,
}: Props) => {
  return (
    <FlatList
      ref={listRef}
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReachedThreshold={0.5}
      onEndReached={onEndReached}
      onScroll={onScroll}
      onMomentumScrollBegin={onMomentumScrollBegin}
      onMomentumScrollEnd={onMomentumScrollEnd}
      keyboardShouldPersistTaps="handled"
      ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
    />
  );
};

export default CustomFlatList;
