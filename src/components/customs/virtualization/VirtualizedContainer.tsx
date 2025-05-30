import { debounce } from 'lodash';
import { memo, useRef, useCallback } from 'react';
import { Virtuoso, VirtuosoProps, VirtuosoHandle } from 'react-virtuoso';

interface VirtualizedContainerProps<T> extends Omit<VirtuosoProps<T, unknown>, 'ref'> {
  items: T[];
  itemContent: (index: number) => React.ReactNode;
  itemKey?: (index: number) => string | number;
  totalCount?: number;
}

const VirtualizedItem = memo(({ 
  index, 
  itemContent,
}: { 
  index: number;
  itemContent: (index: number) => React.ReactNode;
}) => {
  return (
    <div   
      style={{ 
        willChange: 'transform',
        contain: 'strict',
        height: '120px',
        transform: 'translate3d(0,0,0)',
        backfaceVisibility: 'hidden',
        perspective: 1000,
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {itemContent(index)}
    </div>
  );
}
// , (prevProps, nextProps) => {
//   // We consider the item equal if their indices match and the underlying data hasn't changed
//   if (prevProps.index !== nextProps.index) return false;
//   return true;
// }
);

VirtualizedItem.displayName = 'VirtualizedItem';

const ListContainer = memo(({ style, children }: { style?: React.CSSProperties, children?: React.ReactNode }) => (
  <div 
    style={{
      ...style,
      position: 'relative',
      transform: 'translate3d(0,0,0)',
      backfaceVisibility: 'hidden',
      WebkitFontSmoothing: 'antialiased',
      contain: 'paint layout'
    }}
  >
    {children}
  </div>
));

ListContainer.displayName = 'ListContainer';

const RowComponent = ({ ...props }) => (
  <div
    {...props}
    className='h-[120px]'
  />
)
RowComponent.displayName = 'RowComponent';

function VirtualizedContainer<T>({
  items,
  itemContent,
  itemKey,
  ...virtuosoProps
}: VirtualizedContainerProps<T>) {
  const virtuosoRef = useRef<HTMLElement>(null);

  // Optimized scroll handler with debounce
  const handleScroll = useCallback(
    debounce(() => {
      if (!virtuosoRef.current) return;
      
      // Clean up nodes that are far from viewport
      const nodes = virtuosoRef.current.querySelectorAll('.virtuoso-item-list > div');
      const viewportTop = virtuosoRef.current.scrollTop;
      const viewportBottom = viewportTop + virtuosoRef.current.clientHeight;
      const threshold = 1000; // pixels
      
      nodes.forEach((node) => {
        const rect = node.getBoundingClientRect();
        if (rect.bottom < viewportTop - threshold || rect.top > viewportBottom + threshold) {
          // Instead of removing, we'll just hide nodes far from viewport
          (node as HTMLElement).style.height = '0px';
          (node as HTMLElement).style.overflow = 'hidden';
        } else {
          (node as HTMLElement).style.height = '';
          (node as HTMLElement).style.overflow = '';
        }
      });
    }, 150),
    []
  );

  const computeItemKey = useCallback((index: number) => {
    const item = items[index];
    if (!item) return index;
    return (item as any)?.mint || itemKey?.(index) || index;
  }, [items, itemKey]);

  // Memoize the wrappedItemContent to prevent unnecessary re-renders
  const wrappedItemContent = useCallback((index: number) => (
    <VirtualizedItem
      index={index}
      itemContent={itemContent}
    />
  ), [itemContent, items]);

  return (
    <Virtuoso
      ref={virtuosoRef as any}
      onScroll={handleScroll}
      data={items}
      {...virtuosoProps}
      itemContent={wrappedItemContent}
      computeItemKey={computeItemKey}
      defaultItemHeight={120}
      increaseViewportBy={{ top: 1200, bottom: 1200 }}
      overscan={2}
      style={{ 
        height: '100%', 
        width: '100%',
        contain: 'strict',
        position: 'relative'
      }}
      
      components={{
        ...virtuosoProps.components,
        List: ListContainer,
        // Item: RowComponent
        Item: undefined
      }}
    />
  );
}

export default memo(VirtualizedContainer, (prevProps, nextProps) => {
  // Compare only the necessary props to prevent unnecessary re-renders
  return (
    prevProps.items === nextProps.items 
  );
});