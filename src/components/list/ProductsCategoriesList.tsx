import React, { useCallback, useRef, useState } from 'react';
import { FlatList, NativeScrollEvent, NativeSyntheticEvent, Platform, View } from 'react-native';
import { styled } from 'tamagui';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

type ProductsCategoriesListProps<T = { name: string }> = {
  dataItems: T[];
  renderItemsFunction: ({ item }: { item: T }) => JSX.Element;
  keyExtractorFunction: (item: T, index: number) => string;
  scrollEventThrottleMs?: number;
};

export const ProductsCategoriesListStyled = styled(FlatList, {
  width: '100%',
  minHeight: 50,
  maxHeight: 55,
  contentContainerStyle: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },

  $gtSm: {
    width: '50%',
    minHeight: 50,
    maxHeight: 50,
    alignSelf: 'center',
  },
});

export function ProductsCategoriesList<T = { name: string }>({
  dataItems,
  renderItemsFunction,
  keyExtractorFunction,
  scrollEventThrottleMs = 16,
}: ProductsCategoriesListProps<T>) {
  const listRef = useRef<FlatList<T>>(null);
  const offsetXRef = useRef(0);
  const startOffsetRef = useRef(0);
  const [dragging, setDragging] = useState(false);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    offsetXRef.current = e.nativeEvent.contentOffset.x;
  }, []);

  const pan = Gesture.Pan()
    .onBegin(() => {
      setDragging(true);
      startOffsetRef.current = offsetXRef.current;
    })
    .onChange((e) => {
      const next = Math.max(0, offsetXRef.current - e.changeX);
      listRef.current?.scrollToOffset({ offset: next, animated: false });
      offsetXRef.current = next;
    })
    .onFinalize(() => {
      setDragging(false);
    });

  return (
    <>
      {Platform.OS === 'web' ? (
        <GestureDetector gesture={pan}>
          <View
            style={{
              cursor: dragging ? ('grabbing' as any) : ('grab' as any),
              userSelect: 'none' as any,
            }}
          >
            <ProductsCategoriesListStyled
              ref={listRef as any}
              data={dataItems}
              renderItem={renderItemsFunction as any}
              keyExtractor={keyExtractorFunction as any}
              horizontal
              showsHorizontalScrollIndicator={false}
              scrollEnabled
              onScroll={onScroll}
              scrollEventThrottle={scrollEventThrottleMs}
              style={{ WebkitTapHighlightColor: 'transparent' } as any}
            />
          </View>
        </GestureDetector>
      ) : (
        <ProductsCategoriesListStyled
          data={dataItems}
          renderItem={renderItemsFunction}
          keyExtractor={keyExtractorFunction}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      )}
    </>
  );
}
