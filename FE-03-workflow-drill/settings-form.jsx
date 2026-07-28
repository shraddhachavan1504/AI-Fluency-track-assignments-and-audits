import { useState } from "react";
import { Check, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";

const initialValues = {
  displayName: "",
  email: "",
  username: "",
  password: "",
  confirmPassword: "",
  bio: "",
  notifyProduct: true,
  notifyMarketing: false,
};

function validate(values) {
  const errors = {};

  if (!values.displayName.trim()) {
    errors.displayName = "Enter your display name.";
  } else if (values.displayName.trim().length < 2) {
    errors.displayName = "Display name must be at least 2 characters.";
  }

  if (!values.email.trim()) {
    errors.email = "Enter an email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.username.trim()) {
    errors.username = "Choose a username.";
  } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(values.username.trim())) {
    errors.username = "3–20 characters: letters, numbers, and underscores only.";
  }

  if (!values.password) {
    errors.password = "Enter a password.";
  } else if (values.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  } else if (!/[A-Z]/.test(values.password) || !/[0-9]/.test(values.password)) {
    errors.password = "Include at least one uppercase letter and one number.";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Confirm your password.";
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Passwords don't match.";
  }

  if (values.bio.length > 160) {
    errors.bio = "Bio must be 160 characters or fewer.";
  }

  return errors;
}

function Field({ label, htmlFor, error, touched, hint, children }) {
  const showError = touched && error;
  return (
    <div className="mb-5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-stone-700 mb-1.5"
      >
        {label}
      </label>
      {children}
      {showError ? (
        <p className="mt-1.5 flex items-center gap-1 text-sm text-red-600">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-sm text-stone-400">{hint}</p>
      ) : null}
    </div>
  );
}

function inputClasses(hasError) {
  return [
    "w-full rounded-lg border px-3 py-2 text-sm text-stone-900 placeholder-stone-400",
    "focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors",
    hasError
      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
      : "border-stone-300 focus:border-teal-500 focus:ring-teal-100",
  ].join(" ");
}

export default function SettingsForm() {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  const errors = validate(values);
  const hasErrors = Object.keys(errors).length > 0;

  function update(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
    setSavedAt(null);
  }

  function blur(field) {
    setTouched((t) => ({ ...t, [field]: true }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({
      displayName: true,
      email: true,
      username: true,
      password: true,
      confirmPassword: true,
      bio: true,
    });
    if (hasErrors) return;

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    setSubmitting(false);
    setSavedAt(new Date());
  }

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4">
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-stone-900">
            Account settings
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Update your profile, security, and notification preferences.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm"
        >
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wide mb-4">
              Profile
            </h2>

            <Field
              label="Display name"
              htmlFor="displayName"
              error={errors.displayName}
              touched={touched.displayName}
            >
              <input
                id="displayName"
                type="text"
                value={values.displayName}
                onChange={(e) => update("displayName", e.target.value)}
                onBlur={() => blur("displayName")}
                placeholder="Jordan Lee"
                className={inputClasses(touched.displayName && errors.displayName)}
              />
            </Field>

            <Field
              label="Email"
              htmlFor="email"
              error={errors.email}
              touched={touched.email}
            >
              <input
                id="email"
                type="email"
                value={values.email}
                onChange={(e) => update("email", e.target.value)}
                onBlur={() => blur("email")}
                placeholder="you@example.com"
                className={inputClasses(touched.email && errors.email)}
              />
            </Field>

            <Field
              label="Username"
              htmlFor="username"
              error={errors.username}
              touched={touched.username}
              hint="3–20 characters, letters, numbers, and underscores only."
            >
              <input
                id="username"
                type="text"
                value={values.username}
                onChange={(e) => update("username", e.target.value)}
                onBlur={() => blur("username")}
                placeholder="jordanlee"
                className={inputClasses(touched.username && errors.username)}
              />
            </Field>

            <Field
              label="Bio"
              htmlFor="bio"
              error={errors.bio}
              touched={touched.bio}
              hint={`${values.bio.length}/160`}
            >
              <textarea
                id="bio"
                rows={3}
                value={values.bio}
                onChange={(e) => update("bio", e.target.value)}
                onBlur={() => blur("bio")}
                placeholder="Tell people a bit about yourself."
                className={inputClasses(touched.bio && errors.bio) + " resize-none"}
              />
            </Field>
          </div>

          <div className="mb-6 pt-6 border-t border-stone-100">
            <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wide mb-4">
              Password
            </h2>

            <Field
              label="New password"
              htmlFor="password"
              error={errors.password}
              touched={touched.password}
              hint={!errors.password ? "At least 8 characters, one uppercase letter, one number." : undefined}
            >
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={values.password}
                  onChange={(e) => update("password", e.target.value)}
                  onBlur={() => blur("password")}
                  placeholder="••••••••"
                  className={inputClasses(touched.password && errors.password) + " pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </Field>

            <Field
              label="Confirm password"
              htmlFor="confirmPassword"
              error={errors.confirmPassword}
              touched={touched.confirmPassword}
            >
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={values.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                onBlur={() => blur("confirmPassword")}
                placeholder="••••••••"
                className={inputClasses(touched.confirmPassword && errors.confirmPassword)}
              />
            </Field>
          </div>

          <div className="mb-6 pt-6 border-t border-stone-100">
            <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wide mb-4">
              Notifications
            </h2>

            <label className="flex items-start gap-3 mb-3 cursor-pointer">
              <input
                type="checkbox"
                checked={values.notifyProduct}
                onChange={(e) => update("notifyProduct", e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-stone-300 text-teal-600 focus:ring-teal-200"
              />
              <span className="text-sm text-stone-700">
                Product updates
                <span className="block text-stone-400">
                  Announcements about new features and changes.
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={values.notifyMarketing}
                onChange={(e) => update("notifyMarketing", e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-stone-300 text-teal-600 focus:ring-teal-200"
              />
              <span className="text-sm text-stone-700">
                Marketing emails
                <span className="block text-stone-400">
                  Occasional offers and recommendations.
                </span>
              </span>
            </label>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60 transition-colors"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Save changes
            </button>

            {savedAt && !hasErrors && (
              <span className="flex items-center gap-1.5 text-sm text-teal-700">
                <Check className="w-4 h-4" />
                Saved
              </span>
            )}

            {Object.keys(touched).length > 0 && hasErrors && (
              <span className="text-sm text-red-600">
                Fix the errors above to save.
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
