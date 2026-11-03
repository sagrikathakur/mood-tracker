import React, { useState, useEffect, useRef } from "react";

/**
 * Universal Lightweight Motion Utility for React 19
 * Supports <motion.div>, <motion.button>, <motion.span>, <motion.section>, <motion.article>, etc.
 * Features:
 * - whileInView: scroll-triggered reveal animations via native IntersectionObserver
 * - whileHover: smooth spring hover lifts, scales, and rotations
 * - whileTap: responsive press feedback
 * - duration, delay, and cubic-bezier easing
 */
function createMotionComponent(Tag) {
  const Component = React.forwardRef(function MotionComponent(
    {
      children,
      className = "",
      style = {},
      initial,
      animate,
      whileInView,
      viewport,
      whileHover,
      whileTap,
      transition,
      onClick,
      ...props
    },
    forwardedRef
  ) {
    const localRef = useRef(null);
    const elementRef = forwardedRef || localRef;

    const [isInView, setIsInView] = useState(!whileInView);
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);

    const hasWhileInView = Boolean(whileInView);
    const once = viewport?.once !== false;
    const rootMargin = viewport?.margin || "-40px 0px";
    const threshold = viewport?.amount || 0.12;

    useEffect(() => {
      if (!hasWhileInView) return;

      const element = elementRef?.current;
      if (!element || typeof IntersectionObserver === "undefined") {
        setIsInView(true);
        return;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            if (once) {
              observer.unobserve(element);
            }
          } else if (!once) {
            setIsInView(false);
          }
        },
        {
          rootMargin,
          threshold,
        }
      );

      observer.observe(element);
      return () => observer.disconnect();
    }, [hasWhileInView, once, rootMargin, threshold]);

    const activeStyle = { ...style };
    const transforms = [];

    if (style.transform) transforms.push(style.transform);

    // Initial vs whileInView state
    if (whileInView) {
      if (isInView) {
        if (whileInView.opacity !== undefined) activeStyle.opacity = whileInView.opacity;
        if (whileInView.y !== undefined) transforms.push(`translateY(${whileInView.y}px)`);
        if (whileInView.x !== undefined) transforms.push(`translateX(${whileInView.x}px)`);
        if (whileInView.scale !== undefined) transforms.push(`scale(${whileInView.scale})`);
      } else if (initial) {
        if (initial.opacity !== undefined) activeStyle.opacity = initial.opacity;
        if (initial.y !== undefined) transforms.push(`translateY(${initial.y}px)`);
        if (initial.x !== undefined) transforms.push(`translateX(${initial.x}px)`);
        if (initial.scale !== undefined) transforms.push(`scale(${initial.scale})`);
      }
    } else if (initial && animate) {
      if (animate.opacity !== undefined) activeStyle.opacity = animate.opacity;
      if (animate.y !== undefined) transforms.push(`translateY(${animate.y}px)`);
      if (animate.x !== undefined) transforms.push(`translateX(${animate.x}px)`);
      if (animate.scale !== undefined) transforms.push(`scale(${animate.scale})`);
    }

    // Hover transformations
    if (whileHover && isHovered) {
      if (whileHover.scale !== undefined) transforms.push(`scale(${whileHover.scale})`);
      if (whileHover.y !== undefined) transforms.push(`translateY(${whileHover.y}px)`);
      if (whileHover.x !== undefined) transforms.push(`translateX(${whileHover.x}px)`);
      if (whileHover.rotate !== undefined) transforms.push(`rotate(${whileHover.rotate}deg)`);
    }

    // Tap transformations
    if (whileTap && isPressed) {
      if (whileTap.scale !== undefined) transforms.push(`scale(${whileTap.scale})`);
    }

    if (transforms.length > 0) {
      activeStyle.transform = transforms.join(" ");
    }

    const duration = transition?.duration ?? 0.6;
    const delay = transition?.delay ?? 0;
    const ease = transition?.ease || "cubic-bezier(0.16, 1, 0.3, 1)";

    activeStyle.transition = `all ${duration}s ${ease} ${delay}s`;

    return (
      <Tag
        ref={elementRef}
        className={className}
        style={activeStyle}
        onMouseEnter={(e) => {
          setIsHovered(true);
          props.onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          setIsHovered(false);
          setIsPressed(false);
          props.onMouseLeave?.(e);
        }}
        onMouseDown={(e) => {
          setIsPressed(true);
          props.onMouseDown?.(e);
        }}
        onMouseUp={(e) => {
          setIsPressed(false);
          props.onMouseUp?.(e);
        }}
        onClick={onClick}
        {...props}
      >
        {children}
      </Tag>
    );
  });

  Component.displayName = `Motion(${Tag})`;
  return Component;
}

export const motion = {
  div: createMotionComponent("div"),
  button: createMotionComponent("button"),
  span: createMotionComponent("span"),
  section: createMotionComponent("section"),
  article: createMotionComponent("article"),
  header: createMotionComponent("header"),
  footer: createMotionComponent("footer"),
  a: createMotionComponent("a"),
  h1: createMotionComponent("h1"),
  h2: createMotionComponent("h2"),
  h3: createMotionComponent("h3"),
  p: createMotionComponent("p"),
  img: createMotionComponent("img"),
};

export const AnimatePresence = ({ children }) => <>{children}</>;

export default motion;
