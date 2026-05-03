export type SupportUnitFailureGroup = {
  supportUnitKey: string
  failureBlockHash?: string
  logNos: string[]
}

export const mergeSupportUnitFailureGroups = (groups: SupportUnitFailureGroup[]) => {
  const merged = new Map<string, SupportUnitFailureGroup>()

  for (const group of groups) {
    const current = merged.get(group.supportUnitKey)

    if (!current) {
      merged.set(group.supportUnitKey, {
        supportUnitKey: group.supportUnitKey,
        ...(group.failureBlockHash ? { failureBlockHash: group.failureBlockHash } : {}),
        logNos: [...new Set(group.logNos)],
      })
      continue
    }

    merged.set(group.supportUnitKey, {
      supportUnitKey: group.supportUnitKey,
      failureBlockHash: current.failureBlockHash ?? group.failureBlockHash,
      logNos: [...new Set([...current.logNos, ...group.logNos])],
    })
  }

  return [...merged.values()]
}

export const selectFocusedSupportUnit = <Group extends SupportUnitFailureGroup>({
  failureGroups,
  previousFailureGroups,
  focusSupportUnit,
}: {
  failureGroups: Group[]
  previousFailureGroups: SupportUnitFailureGroup[]
  focusSupportUnit?: string
}) => {
  if (!focusSupportUnit) {
    return {
      reportFailureGroups: failureGroups,
      remainingBacklogGroups: [],
      previousFocusedLogNos: [],
      focusedFailureBlockHash: undefined,
      focusedSupportUnitKnown: true,
      focusedSupportUnitResolved: null,
    }
  }

  const reportFailureGroups = failureGroups.filter((group) => group.supportUnitKey === focusSupportUnit)
  const remainingBacklogGroups = failureGroups.filter((group) => group.supportUnitKey !== focusSupportUnit)
  const previousFocusedLogNos = previousFailureGroups
    .filter((group) => group.supportUnitKey === focusSupportUnit)
    .flatMap((group) => group.logNos)
  const focusedSupportUnitKnown = reportFailureGroups.length > 0 || previousFocusedLogNos.length > 0
  const focusedFailureBlockHash =
    reportFailureGroups.find((group) => group.failureBlockHash)?.failureBlockHash ??
    previousFailureGroups.find((group) => group.supportUnitKey === focusSupportUnit)?.failureBlockHash

  return {
    reportFailureGroups,
    remainingBacklogGroups,
    previousFocusedLogNos,
    focusedFailureBlockHash,
    focusedSupportUnitKnown,
    focusedSupportUnitResolved: focusedSupportUnitKnown ? reportFailureGroups.length === 0 : false,
  }
}
