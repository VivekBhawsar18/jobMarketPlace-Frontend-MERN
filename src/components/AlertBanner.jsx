/** Accessible inline alert for auth / form errors */
const AlertBanner = ({ type = "error", title, children, onDismiss }) => {
  const role = type === "error" ? "alert" : "status";
  const className = type === "error" ? "alert alert-error" : type === "success" ? "alert alert-success" : "alert alert-info";
  return (
    <div className={className} role={role}>
      <div>
        {title && <strong>{title}</strong>}
        {children && <div>{children}</div>}
      </div>
      {onDismiss && (
        <button type="button" className="alert-dismiss" onClick={onDismiss} aria-label="Dismiss">
          ×
        </button>
      )}
    </div>
  );
};

export default AlertBanner;
