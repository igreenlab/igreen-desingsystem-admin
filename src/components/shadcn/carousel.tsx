import * as React from "react"
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
  /** Índice do snap visível — o que o `CarouselDots` marca como atual. */
  selectedIndex: number
  /**
   * Um item por PONTO DE PARADA, não por slide.
   *
   * Vem do `api.scrollSnapList()` de propósito: com `slidesToScroll` ou vários slides
   * visíveis por vez, o número de paradas é menor que o de slides — contar
   * `CarouselItem` daria mais bolinhas do que posições alcançáveis, e clicar nas
   * últimas não iria a lugar nenhum.
   */
  scrollSnaps: number[]
  scrollTo: (index: number) => void
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(
  (
    {
      orientation = "horizontal",
      opts,
      setApi,
      plugins,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === "horizontal" ? "x" : "y",
      },
      plugins
    )
    const [canScrollPrev, setCanScrollPrev] = React.useState(false)
    const [canScrollNext, setCanScrollNext] = React.useState(false)
    const [selectedIndex, setSelectedIndex] = React.useState(0)
    const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([])

    const onSelect = React.useCallback((api: CarouselApi) => {
      if (!api) {
        return
      }

      setCanScrollPrev(api.canScrollPrev())
      setCanScrollNext(api.canScrollNext())
      setSelectedIndex(api.selectedScrollSnap())
    }, [])

    /**
     * A lista de paradas muda em `reInit`, não em `select`.
     *
     * Separada do `onSelect` porque os gatilhos são outros: slide adicionado/removido,
     * resize que muda quantos cabem, troca de `slidesToScroll`. Calcular no `select`
     * também funcionaria e recomputaria a cada arraste, sem motivo.
     */
    const onInit = React.useCallback((api: CarouselApi) => {
      if (!api) {
        return
      }

      setScrollSnaps(api.scrollSnapList())
    }, [])

    const scrollPrev = React.useCallback(() => {
      api?.scrollPrev()
    }, [api])

    const scrollNext = React.useCallback(() => {
      api?.scrollNext()
    }, [api])

    const scrollTo = React.useCallback(
      (index: number) => {
        api?.scrollTo(index)
      },
      [api]
    )

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault()
          scrollPrev()
        } else if (event.key === "ArrowRight") {
          event.preventDefault()
          scrollNext()
        }
      },
      [scrollPrev, scrollNext]
    )

    React.useEffect(() => {
      if (!api || !setApi) {
        return
      }

      setApi(api)
    }, [api, setApi])

    React.useEffect(() => {
      if (!api) {
        return
      }

      onInit(api)
      onSelect(api)
      api.on("reInit", onInit)
      api.on("reInit", onSelect)
      api.on("select", onSelect)

      return () => {
        // O `off("reInit")` não existia aqui — só o de "select". Somando os dois
        // listeners novos, ficariam três órfãos por remontagem.
        api?.off("reInit", onInit)
        api?.off("reInit", onSelect)
        api?.off("select", onSelect)
      }
    }, [api, onInit, onSelect])

    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          api: api,
          opts,
          orientation:
            orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
          selectedIndex,
          scrollSnaps,
          scrollTo,
        }}
      >
        <div
          ref={ref}
          onKeyDownCapture={handleKeyDown}
          className={cn("relative", className)}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    )
  }
)
Carousel.displayName = "Carousel"

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div ref={carouselRef} className="overflow-hidden">
      <div
        ref={ref}
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        {...props}
      />
    </div>
  )
})
CarouselContent.displayName = "CarouselContent"

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { orientation } = useCarousel()

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props}
    />
  )
})
CarouselItem.displayName = "CarouselItem"

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, ...props }, ref) => {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      ref={ref}
      color="secondary"
      variant="outline"
      size="icon-xs"
      className={cn(
        "absolute rounded-radius-full",
        orientation === "horizontal"
          ? "-left-12 top-1/2 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
})
CarouselPrevious.displayName = "CarouselPrevious"

const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, ...props }, ref) => {
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      ref={ref}
      color="secondary"
      variant="outline"
      size="icon-xs"
      className={cn(
        "absolute rounded-radius-full",
        orientation === "horizontal"
          ? "-right-12 top-1/2 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight />
      <span className="sr-only">Next slide</span>
    </Button>
  )
})
CarouselNext.displayName = "CarouselNext"

/**
 * `CarouselDots` — indicador de posição, clicável.
 *
 * Decisões que não são óbvias no código:
 *
 * - **Um ponto por PARADA, não por slide** (`scrollSnapList()`). Com vários slides
 *   visíveis por vez ou `slidesToScroll`, contar `CarouselItem` daria bolinhas que não
 *   levam a lugar nenhum.
 * - **Some com 1 parada só.** Indicador de posição única não informa nada e ainda ocupa
 *   linha — o `return null` é o comportamento certo, não um caso não tratado.
 * - **Alvo de 24px com bolinha de 8px dentro.** A bolinha sozinha seria um alvo de toque
 *   de 8px; o botão dá os 24px que o WCAG 2.5.8 pede, e o `place-items-center` mantém o
 *   ponto visualmente pequeno. Os 8px seguem a receita do `groupDot` da `List`.
 * - **`aria-current`, não `role="tab"`.** Tab implica `tabpanel` associado por id, o que
 *   este carrossel não tem — declarar a relação sem ela é pior que não declarar.
 */
const CarouselDots = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { scrollSnaps, selectedIndex, scrollTo, orientation } = useCarousel()

  if (scrollSnaps.length <= 1) {
    return null
  }

  return (
    <div
      ref={ref}
      role="group"
      aria-label="Posição no carrossel"
      className={cn(
        "flex items-center justify-center gap-gp-xs",
        orientation === "vertical" && "flex-col",
        className
      )}
      {...props}
    >
      {scrollSnaps.map((_, i) => {
        const atual = i === selectedIndex
        return (
          <button
            key={i}
            type="button"
            onClick={() => scrollTo(i)}
            aria-label={`Ir para ${i + 1} de ${scrollSnaps.length}`}
            aria-current={atual ? "true" : undefined}
            className={cn(
              "grid size-comp-xs shrink-0 cursor-pointer place-items-center",
              "rounded-radius-full",
              // Padrão 1 — focus estático
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand"
            )}
          >
            <span
              className={cn(
                "size-[8px] rounded-radius-full transition-colors",
                atual ? "bg-bg-brand" : "bg-bg-emphasis hover:bg-bg-accent"
              )}
            />
          </button>
        )
      })}
    </div>
  )
})
CarouselDots.displayName = "CarouselDots"

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
}
