import { driver, type DriveStep } from 'driver.js'
import 'driver.js/dist/driver.css'
import { useI18n } from '@/i18n'

const TOUR_VERSION = 'v1'

const isVisible = (selector: string): boolean => {
  const element = document.querySelector(selector) as HTMLElement | null
  if (!element) return false
  return element.getClientRects().length > 0
}

const pickVisibleSelector = (selectors: string[]): string | null => {
  for (const selector of selectors) {
    if (isVisible(selector)) return selector
  }
  return null
}

const buildStep = (element: string | null, title: string, description: string): DriveStep | null => {
  if (!element) return null
  return {
    element,
    popover: {
      title,
      description,
      side: 'bottom',
      align: 'start',
    },
  }
}

const doneKey = (scope: string) => `fleetly-tour-${scope}-${TOUR_VERSION}`

const createDriver = (labels: { next: string; previous: string; done: string }) => {
  return driver({
    allowClose: true,
    showProgress: true,
    animate: true,
    overlayOpacity: 0.55,
    smoothScroll: true,
    nextBtnText: labels.next,
    prevBtnText: labels.previous,
    doneBtnText: labels.done,
  })
}

type StartOptions = {
  userScope: string
  force?: boolean
}

export function useGuidedTour() {
  const { m } = useI18n()

  const startClientTour = ({ userScope, force = false }: StartOptions) => {
    const labels = m.value.guidedTour.actions
    const texts = m.value.guidedTour.client
    const scope = `client-${userScope}`

    if (!force && localStorage.getItem(doneKey(scope))) return

    const steps: DriveStep[] = []
    const mainNav = pickVisibleSelector(['[data-tour-id="client-main-nav"]', '[data-tour-id="client-mobile-nav"]'])
    const guideButton = pickVisibleSelector(['[data-tour-id="client-tour-button"]'])
    const themeButton = pickVisibleSelector(['[data-tour-id="theme-toggle"]'])
    const languageSwitch = pickVisibleSelector(['[data-tour-id="language-switcher"]'])
    const userMenu = pickVisibleSelector(['[data-tour-id="user-menu"]', '[data-tour-id="user-menu-mobile"]'])
    const contentArea = pickVisibleSelector(['[data-tour-id="client-content"]'])
    const chatWidget = pickVisibleSelector([
      '[data-tour-id="chat-widget-trigger"]',
      '[data-tour-id="chat-widget-panel"]',
      '[data-tour-id="chat-widget"]',
    ])

    steps.push(
      {
        popover: {
          title: texts.welcomeTitle,
          description: texts.welcomeDescription,
          side: 'over',
          align: 'center',
        },
      },
      ...[
        buildStep(mainNav, texts.navigationTitle, texts.navigationDescription),
        buildStep(contentArea, texts.contentTitle, texts.contentDescription),
        buildStep(themeButton, texts.themeTitle, texts.themeDescription),
        buildStep(languageSwitch, texts.languageTitle, texts.languageDescription),
        buildStep(userMenu, texts.profileTitle, texts.profileDescription),
        buildStep(chatWidget, texts.chatTitle, texts.chatDescription),
        buildStep(guideButton, texts.reopenTitle, texts.reopenDescription),
      ].filter((step): step is DriveStep => step !== null),
    )

    const tour = createDriver(labels)
    tour.setSteps(steps)
    tour.drive()
    localStorage.setItem(doneKey(scope), '1')
  }

  const startAdminTour = ({ userScope, force = false }: StartOptions) => {
    const labels = m.value.guidedTour.actions
    const texts = m.value.guidedTour.admin
    const scope = `admin-${userScope}`

    if (!force && localStorage.getItem(doneKey(scope))) return

    const steps: DriveStep[] = []
    const sidebarNav = pickVisibleSelector(['[data-tour-id="admin-main-nav"]', '[data-tour-id="admin-mobile-nav"]'])
    const guideButton = pickVisibleSelector(['[data-tour-id="admin-tour-button"]'])
    const themeButton = pickVisibleSelector(['[data-tour-id="theme-toggle"]'])
    const languageSwitch = pickVisibleSelector(['[data-tour-id="language-switcher"]'])
    const userMenu = pickVisibleSelector(['[data-tour-id="admin-user-menu"]', '[data-tour-id="admin-user-menu-mobile"]'])
    const contentArea = pickVisibleSelector(['[data-tour-id="admin-content"]'])
    const chatWidget = pickVisibleSelector([
      '[data-tour-id="chat-widget-trigger"]',
      '[data-tour-id="chat-widget-panel"]',
      '[data-tour-id="chat-widget"]',
    ])

    steps.push(
      {
        popover: {
          title: texts.welcomeTitle,
          description: texts.welcomeDescription,
          side: 'over',
          align: 'center',
        },
      },
      ...[
        buildStep(sidebarNav, texts.navigationTitle, texts.navigationDescription),
        buildStep(contentArea, texts.contentTitle, texts.contentDescription),
        buildStep(themeButton, texts.themeTitle, texts.themeDescription),
        buildStep(languageSwitch, texts.languageTitle, texts.languageDescription),
        buildStep(userMenu, texts.profileTitle, texts.profileDescription),
        buildStep(chatWidget, texts.chatTitle, texts.chatDescription),
        buildStep(guideButton, texts.reopenTitle, texts.reopenDescription),
      ].filter((step): step is DriveStep => step !== null),
    )

    const tour = createDriver(labels)
    tour.setSteps(steps)
    tour.drive()
    localStorage.setItem(doneKey(scope), '1')
  }

  return {
    startClientTour,
    startAdminTour,
  }
}
