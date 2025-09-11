"use client"

import { useState } from "react"
import { Check, ChevronDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {  PREDEFINED_COLORS, type ColorOption } from "@/lib/colors"

interface ColorPickerProps {
  selectedColors: string[]
  onColorsChange: (colors: string[]) => void
  placeholder?: string
  className?: string
}

export function ColorPicker({
  selectedColors,
  onColorsChange,
  placeholder = "Select colors...",
  className,
}: ColorPickerProps) {
  const [open, setOpen] = useState(false)

  const toggleColor = (colorValue: string) => {
    const newColors = selectedColors.includes(colorValue)
      ? selectedColors.filter((c) => c !== colorValue)
      : [...selectedColors, colorValue]
    onColorsChange(newColors)
  }

  const removeColor = (colorValue: string) => {
    onColorsChange(selectedColors.filter((c) => c !== colorValue))
  }

  const getColorByValue = (value: string): ColorOption | undefined => {
    return PREDEFINED_COLORS.find((color) => color.value === value)
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen} >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="h-12 w-full justify-between text-left font-normal bg-transparent"
          >
            <span className="truncate">
              {selectedColors.length === 0
                ? placeholder
                : `${selectedColors.length} color${selectedColors.length === 1 ? "" : "s"} selected`}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <div className="max-h-60 overflow-auto p-1">
            {PREDEFINED_COLORS.map((color) => (
              <div
                key={color.value}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-sm px-2 py-2 text-sm hover:bg-accent",
                  selectedColors.includes(color.value) && "bg-accent",
                )}
                onClick={() => toggleColor(color.value)}
              >
                <div className="h-4 w-4 rounded-full border border-gray-300" style={{ backgroundColor: color.hex }} />
                <span className="flex-1">{color.name}</span>
                {selectedColors.includes(color.value) && <Check className="h-4 w-4" />}
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Selected Colors Display */}
      {selectedColors.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedColors.map((colorValue) => {
            const color = getColorByValue(colorValue)
            return (
              <Badge key={colorValue} variant="secondary" className="flex items-center gap-2 pr-1">
                <div
                  className="h-3 w-3 rounded-full border border-gray-300"
                  style={{ backgroundColor: color?.hex || "#gray" }}
                />
                <span>{color?.name || colorValue}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => removeColor(colorValue)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )
          })}
        </div>
      )}
    </div>
  )
}
