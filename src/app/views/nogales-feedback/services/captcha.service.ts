import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CaptchaService {
  private mouseMovements: { x: number; y: number; timestamp: number }[] = [];
  private clickPatterns: { x: number; y: number; timestamp: number }[] = [];
  private formInteractions: { type: string; timestamp: number }[] = [];
  private keystrokes: { timestamp: number }[] = [];
  private isHuman: boolean = false;
  private readonly MAX_MOVEMENTS = 30; // Reduced for better performance
  private readonly MAX_CLICKS = 8;
  private readonly MAX_KEYSTROKES = 15;
  private startTime: number = Date.now();

  constructor() {
    this.initializeTracking();
  }

  private initializeTracking() {
    // Track mouse movements with throttling
    let lastMoveTime = 0;
    document.addEventListener('mousemove', (e) => {
      const now = Date.now();
      if (now - lastMoveTime > 100) { // More reasonable throttling
        lastMoveTime = now;
        this.mouseMovements.push({
          x: e.clientX,
          y: e.clientY,
          timestamp: now
        });

        // Keep only recent movements
        if (this.mouseMovements.length > this.MAX_MOVEMENTS) {
          this.mouseMovements.shift();
        }
      }
    });

    // Track clicks
    document.addEventListener('click', (e) => {
      this.clickPatterns.push({
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now()
      });

      // Keep only recent clicks
      if (this.clickPatterns.length > this.MAX_CLICKS) {
        this.clickPatterns.shift();
      }
    });

    // Track keyboard activity
    document.addEventListener('keydown', () => {
      this.keystrokes.push({
        timestamp: Date.now()
      });

      if (this.keystrokes.length > this.MAX_KEYSTROKES) {
        this.keystrokes.shift();
      }
    });
  }

  trackFormInteraction(type: string) {
    this.formInteractions.push({
      type,
      timestamp: Date.now()
    });
  }

  analyzeBehavior(): boolean {
    const timeOnPage = Date.now() - this.startTime;

    // If user has been on page for less than 2 seconds, likely human (too fast for bot)
    if (timeOnPage < 2000) {
      return true;
    }

    // If user has been on page for more than 30 seconds, likely human
    if (timeOnPage > 30000) {
      return true;
    }

    // Basic activity check - if we have any human-like activity, likely human
    const hasMouseActivity = this.mouseMovements.length > 0;
    const hasClickActivity = this.clickPatterns.length > 0;
    const hasKeyboardActivity = this.keystrokes.length > 0;
    const hasFormInteraction = this.formInteractions.length > 0;

    // If no activity at all, might be a bot
    if (!hasMouseActivity && !hasClickActivity && !hasKeyboardActivity && !hasFormInteraction) {
      return false;
    }

    // Calculate individual scores
    const mouseScore = this.analyzeMouseMovements();
    const clickScore = this.analyzeClickPatterns();
    const interactionScore = this.analyzeFormInteractions();
    const keystrokeScore = this.analyzeKeystrokes();
    const timeScore = this.analyzeTimePatterns();

    // Weighted scoring - more lenient approach
    const totalScore = (mouseScore * 0.25) + (clickScore * 0.2) + (interactionScore * 0.2) + (keystrokeScore * 0.15) + (timeScore * 0.2);

    // Much more lenient threshold - favor humans
    this.isHuman = totalScore > 0.2 || hasKeyboardActivity || timeOnPage > 5000;

    return this.isHuman;
  }

  private analyzeMouseMovements(): number {
    if (this.mouseMovements.length === 0) return 0.5; // Neutral score if no mouse data
    if (this.mouseMovements.length < 3) return 0.8; // Assume human if minimal movement

    let totalDistance = 0;
    let naturalMovements = 0;
    let smoothnessScore = 0;

     for (let i = 1; i < this.mouseMovements.length; i++) {
        const prev = this.mouseMovements[i - 1];
        const curr = this.mouseMovements[i];

        // Calculate distance
          const distance = Math.sqrt(
            Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2)
          );
          totalDistance += distance;

        // Check timing - human movements have natural timing
            const timeDiff = curr.timestamp - prev.timestamp;
            if (timeDiff >= 50 && timeDiff <= 500) { // Very lenient timing
              naturalMovements++;
            }

        // Check for reasonable movement distance (not too perfect)
          if (distance > 5 && distance < 200) {
            smoothnessScore++;
          }
       }

    const naturalRatio = naturalMovements / (this.mouseMovements.length - 1);
    const smoothnessRatio = smoothnessScore / (this.mouseMovements.length - 1);
    const hasMovement = totalDistance > 50 ? 1 : 0.3;

    return Math.min(1, (naturalRatio * 0.4) + (smoothnessRatio * 0.4) + (hasMovement * 0.2));
  }

    private analyzeClickPatterns(): number {
        if (this.clickPatterns.length === 0) return 0.3; // Neutral if no clicks
        if (this.clickPatterns.length === 1) return 0.9; // Single click is very human-like

        let naturalClicks = 0;
        for (let i = 1; i < this.clickPatterns.length; i++) {
          const prev = this.clickPatterns[i - 1];
          const curr = this.clickPatterns[i];

          const timeDiff = curr.timestamp - prev.timestamp;
          // Very lenient timing for clicks
          if (timeDiff > 100 && timeDiff < 10000) {
            naturalClicks++;
          }
        }

        return Math.min(1, (naturalClicks / (this.clickPatterns.length - 1)) * 1.2); // Boost score
    }

      private analyzeFormInteractions(): number {
        if (this.formInteractions.length === 0) return 0.5;
        if (this.formInteractions.length === 1) return 0.9; // First interaction is very human

        let naturalInteractions = 0;
        for (let i = 1; i < this.formInteractions.length; i++) {
          const prev = this.formInteractions[i - 1];
          const curr = this.formInteractions[i];

          const timeDiff = curr.timestamp - prev.timestamp;
          if (timeDiff > 200 && timeDiff < 15000) { // Very lenient
            naturalInteractions++;
          }
        }

        return Math.min(1, (naturalInteractions / (this.formInteractions.length - 1)) * 1.1);
      }

    private analyzeKeystrokes(): number {
      if (this.keystrokes.length === 0) return 0.5;
      if (this.keystrokes.length >= 3) return 1; // Typing is very human

      let naturalKeystrokes = 0;
      for (let i = 1; i < this.keystrokes.length; i++) {
        const prev = this.keystrokes[i - 1];
        const curr = this.keystrokes[i];

        const timeDiff = curr.timestamp - prev.timestamp;
        if (timeDiff > 50 && timeDiff < 2000) { // Natural typing rhythm
          naturalKeystrokes++;
        }
      }

      return this.keystrokes.length > 1 ?
        Math.min(1, (naturalKeystrokes / (this.keystrokes.length - 1)) * 1.2) : 0.8;
   }

    private analyzeTimePatterns(): number {
      const timeOnPage = Date.now() - this.startTime;

      // Very fast (under 1 second) - might be bot
      if (timeOnPage < 1000) return 0.2;

      // Reasonable time (1-30 seconds) - likely human
      if (timeOnPage >= 1000 && timeOnPage <= 30000) return 1;

      // Long time (over 30 seconds) - definitely human
      if (timeOnPage > 30000) return 1;

      return 0.8;
    }

  reset() {
    this.mouseMovements = [];
    this.clickPatterns = [];
    this.formInteractions = [];
    this.keystrokes = [];
    this.isHuman = false;
    this.startTime = Date.now(); // Reset timer
  }
}
