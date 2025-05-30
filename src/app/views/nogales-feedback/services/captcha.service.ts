import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CaptchaService {
  private mouseMovements: { x: number; y: number; timestamp: number }[] = [];
  private clickPatterns: { x: number; y: number; timestamp: number }[] = [];
  private formInteractions: { type: string; timestamp: number }[] = [];
  private isHuman: boolean = false;
  private readonly MAX_MOVEMENTS = 50; // Limit stored movements to prevent memory issues

  constructor() {
    this.initializeTracking();
  }

  private initializeTracking() {
    // Track mouse movements with throttling
    let lastMoveTime = 0;
    document.addEventListener('mousemove', (e) => {
      const now = Date.now();
      if (now - lastMoveTime > 50) { // Throttle to every 50ms
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
      if (this.clickPatterns.length > 10) {
        this.clickPatterns.shift();
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
    // If we have enough data, analyze it
    if (this.mouseMovements.length < 5 || this.clickPatterns.length < 1) {
      return true; // Not enough data, assume human
    }

    const mouseScore = this.analyzeMouseMovements();
    const clickScore = this.analyzeClickPatterns();
    const interactionScore = this.analyzeFormInteractions();

    // Weight the scores
    const totalScore = (mouseScore * 0.4) + (clickScore * 0.3) + (interactionScore * 0.3);

    // More lenient threshold
    this.isHuman = totalScore > 0.3;

    return this.isHuman;
  }

  private analyzeMouseMovements(): number {
    if (this.mouseMovements.length < 5) return 1;

    let naturalPatterns = 0;
    let totalDistance = 0;
    let directionChanges = 0;
    let lastDirection = null;

    for (let i = 1; i < this.mouseMovements.length; i++) {
      const prev = this.mouseMovements[i - 1];
      const curr = this.mouseMovements[i];

      // Calculate distance
      const distance = Math.sqrt(
        Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2)
      );
      totalDistance += distance;

      // Calculate direction
      const direction = Math.atan2(curr.y - prev.y, curr.x - prev.x);
      if (lastDirection !== null) {
        const directionDiff = Math.abs(direction - lastDirection);
        if (directionDiff > 0.1) { // Small threshold for direction change
          directionChanges++;
        }
      }
      lastDirection = direction;

      // Check for natural movement patterns
      const timeDiff = curr.timestamp - prev.timestamp;
      if (timeDiff > 0 && timeDiff < 200) { // More lenient time window
        naturalPatterns++;
      }
    }

    // Calculate scores
    const distanceScore = Math.min(1, totalDistance / 1000);
    const directionScore = Math.min(1, directionChanges / this.mouseMovements.length);
    const patternScore = naturalPatterns / this.mouseMovements.length;

    // Combine scores with weights
    return (distanceScore * 0.4) + (directionScore * 0.3) + (patternScore * 0.3);
  }

  private analyzeClickPatterns(): number {
    if (this.clickPatterns.length < 1) return 1;

    let naturalClicks = 0;
    for (let i = 1; i < this.clickPatterns.length; i++) {
      const prev = this.clickPatterns[i - 1];
      const curr = this.clickPatterns[i];

      const timeDiff = curr.timestamp - prev.timestamp;
      if (timeDiff > 50 && timeDiff < 5000) { // More lenient time window
        naturalClicks++;
      }
    }

    return Math.min(1, naturalClicks / this.clickPatterns.length);
  }

  private analyzeFormInteractions(): number {
    if (this.formInteractions.length < 1) return 1;

    let naturalInteractions = 0;
    for (let i = 1; i < this.formInteractions.length; i++) {
      const prev = this.formInteractions[i - 1];
      const curr = this.formInteractions[i];

      const timeDiff = curr.timestamp - prev.timestamp;
      if (timeDiff > 100 && timeDiff < 10000) { // More lenient time window
        naturalInteractions++;
      }
    }

    return Math.min(1, naturalInteractions / this.formInteractions.length);
  }

  reset() {
    this.mouseMovements = [];
    this.clickPatterns = [];
    this.formInteractions = [];
    this.isHuman = false;
  }
}
