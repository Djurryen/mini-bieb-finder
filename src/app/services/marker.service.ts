import { Injectable } from '@angular/core';
import { GoogleMap } from '@angular/google-maps';
import { palette } from '../data/colors';

@Injectable({ providedIn: 'root' })
export class MarkerService {
  private openTooltip: HTMLElement | null = null;

  userMarker!: google.maps.marker.AdvancedMarkerElement;

  createUserMarker(map: GoogleMap, position: google.maps.LatLngLiteral): void {
    if (!this.userMarker) {
      this.userMarker = new google.maps.marker.AdvancedMarkerElement({
        map: map.googleMap,
        position: position,
        title: 'Me',
        content: this.#createMarkerElement(palette.pink_light),
      });
    } else {
      this.userMarker.position = position;
    }
  }

  createPoiMarker(
    map: GoogleMap,
    position: google.maps.LatLngLiteral,
    onButtonClick: () => void,
  ): void {
    const wrapper = this.#createWrapper();
    const markerEl = this.#createMarkerElement(palette.pink_dark);
    const tooltipEl = this.#createTooltipElement(onButtonClick);

    // Toggles this tooltip, and hides others
    markerEl.addEventListener('click', e => {
      e.stopPropagation();
      tooltipEl.style.display === 'none'
        ? this.#showTooltip(tooltipEl)
        : this.#hideTooltip(tooltipEl);
    });

    // Global document click closes tooltip when clicking outside
    document.addEventListener('click', (e) => {
      if (!tooltipEl.contains(e.target as Node) && tooltipEl.style.display !== 'none') {
        this.#hideTooltip(tooltipEl);
      }
    })

    wrapper.appendChild(markerEl);
    wrapper.appendChild(tooltipEl);

    new google.maps.marker.AdvancedMarkerElement({
      map: map.googleMap,
      position,
      title: 'Bieb',
      content: wrapper,
    });
  }

  #createWrapper(): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    return wrapper;
  }

  #createMarkerElement(color: string): HTMLElement {
    const el = document.createElement('div');
    Object.assign(el.style, {
      width: '24px',
      height: '24px',
      backgroundColor: color,
      borderRadius: '50%',
      border: '2px solid white',
      cursor: 'pointer',
      boxShadow: '0 0 3px rgba(0,0,0,0.6)',
    });
    return el;
  }

  #createTooltipElement(onButtonClick: () => void): HTMLElement {
    const tooltip = document.createElement('div');

    tooltip.innerHTML = `
      <button id="tooltip-btn">Bezoeken</button>
    `;

    Object.assign(tooltip.style, {
      position: 'absolute',
      bottom: '32px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#fff',
      padding: '6px 8px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
      whiteSpace: 'nowrap',
      zIndex: '100',
      display: 'none',
    });

    setTimeout(() => {
      const btn = tooltip.querySelector<HTMLButtonElement>('#tooltip-btn');

      if (btn) {
        btn.addEventListener('click', onButtonClick);

        Object.assign(btn.style, {
          backgroundColor: palette.pink_lighter,
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          padding: '6px 12px',
          fontSize: '14px',
          cursor: 'pointer',
          fontWeight: '500',
          transition: 'background-color 0.2s ease',
        });
    
        btn.addEventListener('mouseenter', () => {
          btn.style.backgroundColor = palette.pink_light;
        });
        btn.addEventListener('mouseleave', () => {
          btn.style.backgroundColor = palette.pink_lighter;
        });
      }
    });

    return tooltip;
  }

  #showTooltip(newTooltipEl: HTMLElement): void {
    if (this.openTooltip && this.openTooltip !== newTooltipEl) {
      this.openTooltip.style.display = 'none';
    }

    newTooltipEl.style.display = 'block';
    this.openTooltip = newTooltipEl;
  }

  #hideTooltip(tooltipEl: HTMLElement): void {
    tooltipEl.style.display = 'none';
    if (this.openTooltip === tooltipEl) {
      this.openTooltip = null;
    }
  }
}
