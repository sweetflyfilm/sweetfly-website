/**
 * Typing Animation for the "Beauty in progress." section
 * Types out the adjacent paragraph with natural mistakes and corrections
 */

class TypingAnimator {
  constructor(targetSelector = '.sf-our-story-text') {
    this.targetElement = document.querySelector(targetSelector);
    this.isAnimating = false;
    this.hasAnimated = false;

    if (!this.targetElement) {
      console.warn(`[TypingAnimator] Target element not found: ${targetSelector}`);
      return;
    }

    // Check for prefers-reduced-motion
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.init();
  }

  init() {
    // Observe when the section comes into view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.hasAnimated && !this.prefersReducedMotion) {
            this.hasAnimated = true;
            observer.unobserve(entry.target);
            // Small delay before starting animation
            setTimeout(() => this.startAnimation(), 300);
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(this.targetElement);

    // If already in view on page load, start after a delay
    if (!this.prefersReducedMotion) {
      const rect = this.targetElement.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        setTimeout(() => {
          if (!this.hasAnimated) {
            this.hasAnimated = true;
            setTimeout(() => this.startAnimation(), 300);
          }
        }, 100);
      }
    }
  }

  async startAnimation() {
    if (this.isAnimating || this.prefersReducedMotion) return;

    this.isAnimating = true;
    let displayText = '';

    // Clear the element and prepare for animation
    this.targetElement.innerHTML = '';

    // Segment 1: "Being a creative is understanding your life will be "
    await this.typeText('Being a creative is understanding your life will be ', 50, 80);
    displayText = 'Being a creative is understanding your life will be ';
    this.updateDisplay(displayText);

    // Segment 2: Type mistake "insane", then correct to "crazy"
    await this.typeText('insane', 50, 80);
    displayText += 'insane';
    this.updateDisplay(displayText);
    
    await this.delay(600);
    
    // Delete "insane"
    await this.backspaceText(7);
    displayText = displayText.slice(0, -7);
    this.updateDisplay(displayText);
    
    // Type "crazy"
    await this.typeText('crazy', 60, 90);
    displayText += 'crazy';
    this.updateDisplay(displayText);

    // Continue with main text
    const mainText = '. But crazy and the chaos it brings is what helps us make better art and develop deeper connections. Crazy to try new things. Crazy to go at it as independent artists (just make it!). Crazy to try and maintain friends, family, and your even crazier counterparts (does that make us normal?). But we do it, man, with what we have and all we have. And in the end, we learn our crazy is just ';
    
    await this.typeText(mainText, 40, 70);
    displayText += mainText;
    this.updateDisplay(displayText);

    // Occasional pause
    if (Math.random() < 0.3) {
      await this.delay(400);
    }

    // Special handling for final sentence
    // Type "just"
    await this.typeText('just', 80, 100);
    displayText += 'just';
    this.updateDisplay(displayText);

    // Pause
    await this.delay(800);

    // Type "..."
    await this.typeText('...', 200, 300);
    displayText += '...';
    this.updateDisplay(displayText);

    // Longer pause - contemplation
    await this.delay(1200);

    // Delete "just..." (7 characters)
    await this.backspaceText(7);
    displayText = displayText.slice(0, -7);
    this.updateDisplay(displayText);

    // Type "beautiful"
    await this.typeText('beautiful', 70, 90);
    displayText += 'beautiful';
    this.updateDisplay(displayText);

    // Pause
    await this.delay(700);

    // Type "..."
    await this.typeText('...', 200, 300);
    displayText += '...';
    this.updateDisplay(displayText);

    // Longer pause - contemplation
    await this.delay(1500);

    // Delete "beautiful..." (12 characters)
    await this.backspaceText(12);
    displayText = displayText.slice(0, -12);
    this.updateDisplay(displayText);

    // Type the final phrase
    await this.typeText('beauty in progress.', 50, 80);
    displayText += 'beauty in progress.';
    this.updateDisplay(displayText);

    // Final pause
    await this.delay(400);

    // Animation complete - finalize and add HTML structure
    this.finalizeDisplay();
    this.isAnimating = false;
  }

  async typeText(text, minDelay = 40, maxDelay = 70) {
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      
      // Add character to display
      const currentText = this.targetElement.textContent || '';
      this.updateDisplay(currentText + char);

      // Variable typing speed for natural feel
      const delay = minDelay + Math.random() * (maxDelay - minDelay);
      await this.delay(delay);

      // Occasionally add a typo (random character mistake that gets corrected)
      if (Math.random() < 0.05 && i < text.length - 1) {
        const wrongChar = String.fromCharCode(
          97 + Math.floor(Math.random() * 26)
        ); // random lowercase letter
        this.updateDisplay((this.targetElement.textContent || '') + wrongChar);
        await this.delay(200);

        // Delete the wrong character
        const textWithoutWrong = (this.targetElement.textContent || '').slice(0, -1);
        this.updateDisplay(textWithoutWrong);
        await this.delay(150);
      }
    }
  }

  async backspaceText(count) {
    for (let i = 0; i < count; i++) {
      const current = this.targetElement.textContent || '';
      this.updateDisplay(current.slice(0, -1));
      await this.delay(50 + Math.random() * 40);
    }
  }

  updateDisplay(text) {
    this.targetElement.textContent = text;
  }

  finalizeDisplay() {
    // Recreate the HTML structure with proper styling
    this.targetElement.innerHTML = `<strong>Being a creative is understanding your life will be crazy.</strong> But crazy and the chaos it brings is what helps us make better art and develop deeper connections. Crazy to try new things. Crazy to go at it as independent artists (just make it!). Crazy to try and maintain friends, family, and your even crazier counterparts (does that make us normal?). But we do it, man, with what we have and all we have. And in the end, we learn our crazy is just beauty in progress.`;
    
    // Add class to remove cursor animation
    setTimeout(() => {
      this.targetElement.classList.add('typing-complete');
    }, 100);
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new TypingAnimator('.sf-our-story-text');
  });
} else {
  new TypingAnimator('.sf-our-story-text');
}

