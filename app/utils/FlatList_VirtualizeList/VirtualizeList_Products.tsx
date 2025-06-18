// utils/CustomVirtualizedList.tsx
import React from 'react'
import { VirtualizedList, View, NativeScrollEvent, NativeSyntheticEvent } from 'react-native'

type Props = {
  data: any[]
  renderItem: ({ item }: any) => JSX.Element
  keyExtractor: (item: any) => string
  listRef?: React.RefObject<VirtualizedList<any>>
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void
  onMomentumScrollBegin?: () => void
  onMomentumScrollEnd?: () => void
}

const CustomVirtualizedList = ({ data, renderItem, keyExtractor, listRef, onScroll, onMomentumScrollBegin, onMomentumScrollEnd }: Props) => {
  return <VirtualizedList ref={listRef} data={data} getItem={(data, index) => data[index]} getItemCount={(data) => data.length} keyExtractor={keyExtractor} renderItem={renderItem} initialNumToRender={10} windowSize={5} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" style={{ flex: 1 }} onScroll={onScroll} onMomentumScrollBegin={onMomentumScrollBegin} onMomentumScrollEnd={onMomentumScrollEnd} ItemSeparatorComponent={() => <View style={{ height: 8 }} />} />
}

export default CustomVirtualizedList
