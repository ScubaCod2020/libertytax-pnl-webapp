/**
 * Angular Test Setup
 * This file will be used when migrating to Angular
 * It provides the same test structure as React tests
 */

import { TestBed } from '@angular/core/testing'
import { ComponentFixture } from '@angular/core/testing'
import { DebugElement } from '@angular/core'
import { By } from '@angular/platform-browser'

/**
 * Angular Test Utilities
 * These utilities mirror the React Testing Library API
 * to maintain consistency between frameworks
 */

export class AngularTestUtils {
  constructor(private fixture: ComponentFixture<any>) {}
  
  /**
   * Get element by test ID (similar to getByTestId)
   */
  getByTestId(testId: string): DebugElement {
    return this.fixture.debugElement.query(By.css(`[data-testid="${testId}"]`))
  }
  
  /**
   * Get element by role (similar to getByRole)
   */
  getByRole(role: string, options?: { name?: string }): DebugElement {
    const selector = options?.name 
      ? `[role="${role}"][aria-label*="${options.name}"]`
      : `[role="${role}"]`
    return this.fixture.debugElement.query(By.css(selector))
  }
  
  /**
   * Get element by text (similar to getByText)
   */
  getByText(text: string | RegExp): DebugElement {
    if (typeof text === 'string') {
      return this.fixture.debugElement.query(By.css(`:contains("${text}")`))
    } else {
      // For regex, we'll need to search through all elements
      const allElements = this.fixture.debugElement.queryAll(By.css('*'))
      return allElements.find(el => text.test(el.nativeElement.textContent))
    }
  }
  
  /**
   * Get element by label text (similar to getByLabelText)
   */
  getByLabelText(labelText: string | RegExp): DebugElement {
    if (typeof labelText === 'string') {
      return this.fixture.debugElement.query(By.css(`label:contains("${labelText}")`))
    } else {
      const allLabels = this.fixture.debugElement.queryAll(By.css('label'))
      return allLabels.find(el => labelText.test(el.nativeElement.textContent))
    }
  }
  
  /**
   * Click element (similar to user.click)
   */
  async click(element: DebugElement): Promise<void> {
    element.triggerEventHandler('click', null)
    this.fixture.detectChanges()
  }
  
  /**
   * Type in input (similar to user.type)
   */
  async type(element: DebugElement, text: string): Promise<void> {
    element.nativeElement.value = text
    element.triggerEventHandler('input', { target: { value: text } })
    this.fixture.detectChanges()
  }
  
  /**
   * Select option (similar to user.selectOptions)
   */
  async selectOption(element: DebugElement, value: string): Promise<void> {
    element.nativeElement.value = value
    element.triggerEventHandler('change', { target: { value } })
    this.fixture.detectChanges()
  }
}

/**
 * Angular Test Setup Helper
 * This function sets up Angular tests similar to React Testing Library
 */
export function renderAngularComponent<T>(component: any, providers: any[] = []): {
  fixture: ComponentFixture<T>
  utils: AngularTestUtils
} {
  TestBed.configureTestingModule({
    declarations: [component],
    providers: providers
  })
  
  const fixture = TestBed.createComponent(component)
  const utils = new AngularTestUtils(fixture)
  
  return { fixture, utils }
}

/**
 * Angular Test Expectations
 * These provide the same API as React Testing Library expectations
 */
export class AngularExpectations {
  constructor(private element: DebugElement) {}
  
  toBeInTheDocument(): void {
    expect(this.element).toBeTruthy()
  }
  
  toHaveTextContent(text: string | RegExp): void {
    if (typeof text === 'string') {
      expect(this.element.nativeElement.textContent).toContain(text)
    } else {
      expect(this.element.nativeElement.textContent).toMatch(text)
    }
  }
  
  toHaveAttribute(attribute: string, value?: string): void {
    if (value) {
      expect(this.element.nativeElement.getAttribute(attribute)).toBe(value)
    } else {
      expect(this.element.nativeElement.hasAttribute(attribute)).toBe(true)
    }
  }
  
  toHaveValue(value: string): void {
    expect(this.element.nativeElement.value).toBe(value)
  }
  
  toBeVisible(): void {
    const style = window.getComputedStyle(this.element.nativeElement)
    expect(style.display).not.toBe('none')
    expect(style.visibility).not.toBe('hidden')
  }
}

/**
 * Helper function to create expectations
 */
export function expectElement(element: DebugElement): AngularExpectations {
  return new AngularExpectations(element)
}
