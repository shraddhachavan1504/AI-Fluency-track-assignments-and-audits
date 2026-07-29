import React, { useState, useRef } from "react";
import { AlertCircle, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[A-Za-z0-9_]+$/;

const initialValues = {
  displayName: "",
  email: "",
  username: "",
  bio: "",
  password: "",
  confirmPassword: "",
  productUpdates: true,
  marketingEmails: false,
};

function validateField(name, values) {
  switch (name) {
    case "displayName": {
      const v = values.displayName.trim();
      if (!v) return "Display name is required.";
      if (v.length < 2) return "Display name must be at least 2 characters.";
      return "";
    }
    case "email": {
      const v = values.email.trim();
      if (!v) return "Email is required.";
      if (!EMAIL_RE.test(v)) return "Enter a valid email address.";
      return "";
    }
    case "username": {
      const v = values.username.trim();
      if (!v) return "Username is required.";
      if (v.length < 3 || v.length > 20)
        return "Username must be 3-20 characters.";
      if (!USERNAME_RE.test(v))
        return "Username can only contain letters, numbers, and underscores.";
      return "";
    }
    case "bio": {
      if (values.bio.length > 160) return "Bio must be 160 characters or fewer.";
      return "";
    }
    case "password": {
      const v = values.password;
      if (!v) return "Password is required.";
      if (v.length < 8) return "Password must be at least 8 characters.";
      if (!/[A-Z]/.test(v)) return "Password must contain an uppercase letter.";
      if (!/[0-9]/.test(v)) return "Password must contain a number.";
      return "";
    }
    case "confirmPassword": {
      if (!values.confirmPassword) return "Please confirm your password.";
      if (values.confirmPassword !== values.password)
        return "Passwords do not match.";
      return "";
    }
    default:
      return "";
  }
}

const FIELD_ORDER = [
  "displayName",
  "email",
  "username",
  "bio",
  "password",
  "confirmPassword",
];

function validateAll(values) {
  const errors = {};
  FIELD_ORDER.forEach((name) => {
    const err = validateField(name, values);
    if (err) errors[name] = err;
  });
  return errors;
}

export default function SettingsForm({ onSubmit }) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("idle"); // idle | submitting | success

  const fieldRefs = useRef({});

  const setFieldRef = (name) => (el) => {
    fieldRefs.current[name] = el;
  };

  function handleChange(e) {
    const { name, type, value, checked } = e.target;
    const nextValue = type === "checkbox" ? checked : value;

    setValues((prev) => {
      const nextValues = { ...prev, [name]: nextValue };
      // Re-validate live only for fields that are already touched/submitted,
      // and always re-check confirmPassword when password changes.
      if (touched[name] || submitAttempted) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [name]: validateField(name, nextValues),
        }));
      }
      if (
        name === "password" &&
        (touched.confirmPassword || submitAttempted)
      ) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          confirmPassword: validateField("confirmPassword", nextValues),
        }));
      }
      return nextValues;
    });
  }

  function handleBlur(e) {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, values) }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitAttempted(true);

    const allTouched = {};
    FIELD_ORDER.forEach((name) => {
      allTouched[name] = true;
    });
    setTouched((prev) => ({ ...prev, ...allTouched }));

    const nextErrors = validateAll(values);
    setErrors(nextErrors);

    const firstInvalid = FIELD_ORDER.find((name) => nextErrors[name]);
    if (firstInvalid) {
      const node = fieldRefs.current[firstInvalid];
      if (node && typeof node.focus === "function") {
        node.focus();
      }
      return;
    }

    setSubmitStatus("submitting");
    // Simulate an async submit; replace with real API call as needed.
    setTimeout(() => {
      setSubmitStatus("success");
      if (onSubmit) onSubmit(values);
    }, 400);
  }

  function errorFor(name) {
    return (touched[name] || submitAttempted) && errors[name]
      ? errors[name]
      : "";
  }

  function fieldProps(name) {
    const error = errorFor(name);
    return {
      name,
      id: name,
      ref: setFieldRef(name),
      onChange: handleChange,
      onBlur: handleBlur,
      "aria-invalid": error ? "true" : "false",
      "aria-describedby": error ? `${name}-error` : undefined,
    };
  }

  return (
    <div className="mx-auto w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">
          Account settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Update your profile, security, and notification preferences.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <fieldset className="space-y-5">
          <legend className="sr-only">Profile details</legend>

          {/* Display name */}
          <div>
            <label
              htmlFor="displayName"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Display name
            </label>
            <input
              type="text"
              value={values.displayName}
              {...fieldProps("displayName")}
              className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:ring-2 ${
                errorFor("displayName")
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"
              }`}
            />
            {errorFor("displayName") && (
              <p
                id="displayName-error"
                role="alert"
                className="mt-1 flex items-center gap-1 text-sm text-red-600"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {errorFor("displayName")}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Email
            </label>
            <input
              type="email"
              value={values.email}
              {...fieldProps("email")}
              className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:ring-2 ${
                errorFor("email")
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"
              }`}
            />
            {errorFor("email") && (
              <p
                id="email-error"
                role="alert"
                className="mt-1 flex items-center gap-1 text-sm text-red-600"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {errorFor("email")}
              </p>
            )}
          </div>

          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Username
            </label>
            <input
              type="text"
              value={values.username}
              {...fieldProps("username")}
              className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:ring-2 ${
                errorFor("username")
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"
              }`}
            />
            {errorFor("username") && (
              <p
                id="username-error"
                role="alert"
                className="mt-1 flex items-center gap-1 text-sm text-red-600"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {errorFor("username")}
              </p>
            )}
          </div>

          {/* Bio */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-slate-700"
              >
                Bio{" "}
                <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <span
                className={`text-xs ${
                  values.bio.length > 160 ? "text-red-500" : "text-slate-400"
                }`}
              >
                {values.bio.length}/160
              </span>
            </div>
            <textarea
              rows={3}
              value={values.bio}
              {...fieldProps("bio")}
              className={`w-full resize-none rounded-lg border px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:ring-2 ${
                errorFor("bio")
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"
              }`}
            />
            {errorFor("bio") && (
              <p
                id="bio-error"
                role="alert"
                className="mt-1 flex items-center gap-1 text-sm text-red-600"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {errorFor("bio")}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={values.password}
                {...fieldProps("password")}
                className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm text-slate-900 shadow-sm outline-none transition focus:ring-2 ${
                  errorFor("password")
                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                    : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errorFor("password") && (
              <p
                id="password-error"
                role="alert"
                className="mt-1 flex items-center gap-1 text-sm text-red-600"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {errorFor("password")}
              </p>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Confirm password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={values.confirmPassword}
                {...fieldProps("confirmPassword")}
                className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm text-slate-900 shadow-sm outline-none transition focus:ring-2 ${
                  errorFor("confirmPassword")
                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                    : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((s) => !s)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600"
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errorFor("confirmPassword") && (
              <p
                id="confirmPassword-error"
                role="alert"
                className="mt-1 flex items-center gap-1 text-sm text-red-600"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {errorFor("confirmPassword")}
              </p>
            )}
          </div>
        </fieldset>

        <fieldset className="mt-6 space-y-3 border-t border-slate-100 pt-5">
          <legend className="mb-1 text-sm font-medium text-slate-700">
            Notifications
          </legend>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="productUpdates"
              checked={values.productUpdates}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Product updates
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="marketingEmails"
              checked={values.marketingEmails}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Marketing emails
          </label>
        </fieldset>

        <button
          type="submit"
          disabled={submitStatus === "submitting"}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitStatus === "submitting" && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
          {submitStatus === "success" ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Saved
            </>
          ) : (
            "Save changes"
          )}
        </button>
      </form>
    </div>
  );
}
